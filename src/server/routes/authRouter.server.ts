import { prisma } from '$api/clients/prisma.server';
import {
	auth,
	generateVerificationToken,
	getUserAttributes,
	googleAuth,
	validateToken
} from '$api/clients/luciaClient.server';
import {
	sendEmailResetPassword,
	sendEmailVerificationEmail
} from '$api/clients/mailerClient.server';
import { transferUserData } from '$api/controllers/userData.server';
import { dev } from '$app/environment';
import { customAlphabet, nanoid } from 'nanoid';
import { getResponse, responseStatus, type APIType } from '$api/root.server';
import { Argon2id } from 'oslo/password';
import type { User } from 'lucia';
import { generateCodeVerifier, generateState } from 'arctic';

let alphanumericGenerator = customAlphabet(
	'0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz',
	10
);

export default {
	signOnGoogle: async ({ ctx, privateCtx }) => {
		ctx.status = responseStatus.INTERNAL_SERVER_ERROR;

		let redirectUrl: URL | undefined = undefined;
		if (googleAuth !== undefined) {
			// const [url, state] = await googleAuth.getAuthorizationUrl();
			const state = generateState();
			const codeVerifier = generateCodeVerifier();
			const url = await googleAuth.createAuthorizationURL(state, codeVerifier, {
				scopes: ['email', 'profile']
			});
			redirectUrl = url;

			ctx.cookies.set('google_oauth_code_verifier', codeVerifier, {
				secure: !dev,
				path: '/',
				maxAge: 60 * 60
			});
			ctx.cookies.set('google_oauth_state', state, {
				secure: !dev,
				path: '/',
				maxAge: 60 * 60
			});

			ctx.status = responseStatus.SUCCESS;
		}

		return getResponse(ctx.status, {
			[responseStatus.SUCCESS]: {
				stores: { userAttributes: { set: privateCtx.userAttributes } },
				clientRedirect: redirectUrl?.toString()
			},
			[responseStatus.INTERNAL_SERVER_ERROR]: {}
		});
	},
	signInEmail: async ({ ctx, input }) => {
		ctx.status = responseStatus.INTERNAL_SERVER_ERROR;
		let userAttributes: User | null = null;
		let userId: string | null = null;
		try {
			const latestAuthKeyRecord = await prisma.authKey.findFirst({
				where: {
					authUser: {
						email: input.email
					}
				},
				orderBy: {
					created: 'desc'
				}
			});
			let hashExists = false;
			const argon2id = new Argon2id();

			if (latestAuthKeyRecord?.hashed_password && !hashExists) {
				const verifiedKey = await argon2id.verify(
					latestAuthKeyRecord.hashed_password,
					input.password
				);
				if (verifiedKey) {
					userId = latestAuthKeyRecord.user_id;
					hashExists = true;
				}
			}
			if (!hashExists) {
				throw new Error('Incorrect email or password.');
			}
		} catch (e) {
			// https://lucia-auth.com/reference/lucia-auth/auth?sveltekit#usekey
			ctx.status = responseStatus.UNAUTHORIZED;
		}
		if (userId) {
			try {
				const is_verified = (
					await prisma.authUser.findFirst({
						where: {
							id: userId
						},
						select: {
							is_verified: true
						}
					})
				)?.is_verified;
				if (is_verified) {
					// Invalidate all sessions and create a new one
					await auth.invalidateUserSessions(userId);
					const session = await auth.createSession(userId, {});
					// ctx.authRequest.setSession(session);
					ctx.cookies.set(auth.sessionCookieName, session.id, {
						path: '/',
						maxAge: 60 * 60
					});

					const { user } = (await auth.validateSession(session.id)) ?? null;
					userAttributes = user;

					const unloggedId = ctx.cookies.get('unloggedinSession');
					if (unloggedId) {
						await transferUserData(prisma, userId, unloggedId);
					}

					ctx.status = responseStatus.SUCCESS;
				} else {
					ctx.status = responseStatus.PRECONDITION_FAILED;
				}
			} catch (e) {
				ctx.status = responseStatus.INTERNAL_SERVER_ERROR;
			}
		} else {
			ctx.status = responseStatus.UNAUTHORIZED;
		}

		return getResponse(ctx.status, {
			[responseStatus.SUCCESS]: {
				stores: { userAttributes: { set: userAttributes } },
				clientRedirect: '/refreshLogin'
			},
			[responseStatus.PRECONDITION_FAILED]: { message: 'Account not verified.' },
			[responseStatus.UNAUTHORIZED]: { message: 'Incorrect email or password.' },
			[responseStatus.INTERNAL_SERVER_ERROR]: { message: 'Internal Server Error.' }
		});
	},
	signUpEmail: async ({ ctx, privateCtx, input }) => {
		ctx.status = responseStatus.INTERNAL_SERVER_ERROR;
		const ipAddress = ctx.request.headers.get('x-forwarded-for') || ctx.getClientAddress();

		const createUserAndSendEmail = async (prInput: typeof input) => {
			// create user
			const argon2id = new Argon2id();
			const hash = await argon2id.hash(prInput.password);

			const authUserRecord = await prisma.authUser.create({
				data: {
					id: nanoid(),
					username: alphanumericGenerator(10),
					firstName: prInput.firstName,
					lastName: prInput.lastName,
					email: prInput.email,
					profilePicture: '',
					is_verified: false,
					is_admin: false,
					ipAddress
				}
			});

			await prisma.authKey.create({
				data: {
					id: nanoid(),
					authUser: {
						connect: {
							id: authUserRecord.id
						}
					},
					hashed_password: hash
				}
			});
			const luciaUser = getUserAttributes(authUserRecord);
			const user = {
				id: luciaUser.id,
				is_verified: false,
				username: luciaUser.username,
				firstName: luciaUser.firstName,
				lastName: luciaUser.lastName,
				email: luciaUser.email,
				profilePicture: luciaUser.profilePicture
			};

			// send email verification
			const token = await generateVerificationToken(user.id);
			await sendEmailVerificationEmail(user.email, token);
		};

		try {
			const user = await prisma.authUser.findUnique({
				where: { email: input.email }
			});
			if (!user) {
				await createUserAndSendEmail(input);
				// set status
				ctx.status = responseStatus.SUCCESS;
			} else if (user.is_verified == false) {
				// delete user if user is not verified
				await auth.invalidateSession(user.id);
				// await auth.invalidateAllUserSessions(user.id);
				await prisma.authUser.delete({
					where: {
						id: user.id
					}
				});

				await createUserAndSendEmail(input);
				// set status
				ctx.status = responseStatus.SUCCESS;
			} else if (user.is_verified == true) {
				// set status
				ctx.status = responseStatus.CONFLICT;
			} else {
				ctx.status = responseStatus.INTERNAL_SERVER_ERROR;
			}
		} catch (e) {
			ctx.status = responseStatus.INTERNAL_SERVER_ERROR;
		}

		return getResponse(ctx.status, {
			[responseStatus.SUCCESS]: {
				data: {},
				stores: { userAttributes: { set: privateCtx.userAttributes } },
				clientRedirect: '/signup/verify'
			},
			[responseStatus.CONFLICT]: { message: 'Account already exists.' },
			[responseStatus.INTERNAL_SERVER_ERROR]: { message: 'Internal Server Error.' }
		});
	},
	verifyEmailSignup: async ({ ctx, privateCtx, input }) => {
		ctx.status = responseStatus.INTERNAL_SERVER_ERROR;

		try {
			const codeRow = await prisma.authToken.findUnique({
				where: {
					id: input.code.trim()
				}
			});
			if (codeRow) {
				ctx.status = responseStatus.SUCCESS;
			}
		} catch (e) {
			console.log('🚀 ~ verifyCode: ~ e:', e);
		}

		return getResponse(ctx.status, {
			[responseStatus.SUCCESS]: {
				data: { code: input.code },
				stores: { userAttributes: { set: privateCtx.userAttributes } },
				clientRedirect: '/api/callback/email?code=' + input.code.trim()
			},
			[responseStatus.NOT_FOUND]: { message: 'No account attributed with this Email.' },
			[responseStatus.INTERNAL_SERVER_ERROR]: { message: 'Internal Server Error.' }
		});
	},
	signOut: async ({ ctx }) => {
		const sessionToken = ctx.cookies.get(auth.sessionCookieName) ?? '';
		await auth.invalidateSession(sessionToken);

		auth.invalidateSession(sessionToken);

		ctx.cookies.set(auth.sessionCookieName, '', {
			path: '/',
			maxAge: 1
		});

		ctx.status = responseStatus.SUCCESS;

		return getResponse(ctx.status, {
			[responseStatus.SUCCESS]: { stores: { userAttributes: { set: null } }, clientRedirect: '' }
		});
	},
	sendResetPasswordEmail: async ({ ctx, privateCtx, input }) => {
		ctx.status = responseStatus.INTERNAL_SERVER_ERROR;

		const authUserRecord = await prisma.authUser.findUnique({
			where: { email: input.email }
		});
		if (authUserRecord) {
			try {
				const token = await generateVerificationToken(authUserRecord.id);
				await sendEmailResetPassword(authUserRecord.email, token.toString());
				ctx.status = responseStatus.SUCCESS;
			} catch (e) {
				ctx.status = responseStatus.INTERNAL_SERVER_ERROR;
			}
		} else {
			ctx.status = responseStatus.NOT_FOUND;
		}

		return getResponse(ctx.status, {
			[responseStatus.SUCCESS]: {
				stores: { userAttributes: { set: privateCtx.userAttributes } },
				clientRedirect: '/forgotPassword/verify'
			},
			[responseStatus.NOT_FOUND]: { message: 'No account attributed with this Email.' },
			[responseStatus.INTERNAL_SERVER_ERROR]: { message: 'Internal Server Error.' }
		});
	},
	verifyEmailResetPassword: async ({ ctx, privateCtx, input }) => {
		ctx.status = responseStatus.INTERNAL_SERVER_ERROR;

		try {
			const codeRow = await prisma.authToken.findUnique({
				where: {
					id: input.code.trim()
				}
			});
			if (codeRow) {
				ctx.status = responseStatus.SUCCESS;
			}
		} catch (e) {
			console.log('🚀 ~ verifyCode: ~ e:', e);
		}

		return getResponse(ctx.status, {
			[responseStatus.SUCCESS]: {
				data: { code: input.code },
				stores: { userAttributes: { set: privateCtx.userAttributes } },
				clientRedirect: '/forgotPassword/reset?code=' + input.code.trim()
			},
			[responseStatus.NOT_FOUND]: { message: 'No account attributed with this Email.' },
			[responseStatus.INTERNAL_SERVER_ERROR]: { message: 'Internal Server Error.' }
		});
	},
	resetPasswordEmail: async ({ ctx, input }) => {
		ctx.status = responseStatus.INTERNAL_SERVER_ERROR;
		let userAttributes: Awaited<ReturnType<typeof validateToken>> | null = null;
		let userKey: string | null = null;

		try {
			userAttributes = await validateToken(input.code ?? '');
			userKey = userAttributes.id;
		} catch (e) {
			ctx.status = responseStatus.NOT_FOUND;
		}

		if (userKey) {
			try {
				if (userAttributes) {
					await auth.invalidateUserSessions(userAttributes.id);

					// update key
					const argon2id = new Argon2id();
					const hash = await argon2id.hash(input.password);
					await prisma.authKey.create({
						data: {
							id: nanoid(),
							authUser: {
								connect: {
									id: userAttributes.id
								}
							},
							hashed_password: hash
						}
					});

					const session = await auth.createSession(userAttributes.id, {});

					ctx.cookies.set(auth.sessionCookieName, session.id, {
						path: '/',
						maxAge: 60 * 60
					});
					const { user } = await auth.validateSession(session.id);
					userAttributes = user;

					ctx.status = responseStatus.SUCCESS;
				} else {
					ctx.status = responseStatus.NOT_FOUND;
				}
			} catch (e) {
				ctx.status = responseStatus.INTERNAL_SERVER_ERROR;
			}
		} else {
			ctx.status = responseStatus.NOT_FOUND;
		}

		return getResponse(ctx.status, {
			[responseStatus.SUCCESS]: {
				stores: { userAttributes: { set: userAttributes } },
				clientRedirect: '/refreshLogin'
			},
			[responseStatus.NOT_FOUND]: { message: 'Ivalid request, please generate new reset link.' },
			[responseStatus.INTERNAL_SERVER_ERROR]: { message: 'Internal Server Error.' }
		});
	},
	refreshUser: async ({ ctx, privateCtx }) => {
		let userAttributes: User | null = null;

		userAttributes = privateCtx.userAttributes;
		// eslint-disable-next-line prefer-const
		ctx.status = privateCtx.userAttributes.id
			? responseStatus.SUCCESS
			: responseStatus.UNAUTHORIZED;

		return getResponse(ctx.status, {
			[responseStatus.SUCCESS]: { stores: { userAttributes: { set: userAttributes } } },
			[responseStatus.UNAUTHORIZED]: { message: 'User not logged in.' }
		});
	}
} satisfies APIType['authRouter'];
