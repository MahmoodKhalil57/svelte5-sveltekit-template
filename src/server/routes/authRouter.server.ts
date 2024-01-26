import { prisma } from '$api/clients/prisma.server';
import type { APITypeB } from '$lib/apiUtils/server/ApiUtils.type.server';
// import { privateProcedure } from '$api/preRequest/middleware.server';
import {
	auth,
	generateVerificationToken,
	googleAuth,
	validateToken
} from '$api/clients/luciaClient.server';
import {
	sendEmailResetPassword,
	sendEmailVerificationEmail
} from '$api/clients/mailerClient.server';
import { transferUserData } from '$api/controllers/userData.server';
import { dev } from '$app/environment';
import { responseStatus, getResponse } from '$lib/apiUtils/server/apiUtils.server';
import { nanoid } from 'nanoid';
import { privateProcedure } from '$api/preRequest/middleware.server';

export default {
	signOut: async ({ ctx }) => {
		await privateProcedure(ctx);
		const sessionToken = ctx.cookies.get('auth_session') ?? '';
		await auth.invalidateSession(sessionToken);

		ctx.authRequest.setSession(null);

		ctx.cookies.set('auth_session', '', {
			path: '/',
			maxAge: 1
		});

		ctx.status = responseStatus.SUCCESS;

		return getResponse(ctx.status, {
			[responseStatus.SUCCESS]: { data: { userSession: null } }
		});
	},
	signUpEmail: async ({ ctx, input }) => {
		ctx.status = responseStatus.INTERNAL_SERVER_ERROR;

		const createUserAndSendEmail = async (prInput: typeof input) => {
			// create user
			const authUser = await auth.createUser({
				key: {
					providerId: 'email',
					providerUserId: prInput.email,
					password: prInput.password
				},
				attributes: {
					username: nanoid(10),
					firstName: prInput.firstName,
					lastName: prInput.lastName,
					email: prInput.email,
					is_verified: false,
					is_admin: false
				}
			});
			const user = {
				id: authUser.userId,
				is_verified: false,
				username: authUser.username,
				firstName: authUser.firstName,
				lastName: authUser.lastName,
				email: authUser.email
			};

			// send email verification
			const token = await generateVerificationToken(user.id);
			await sendEmailVerificationEmail(user.email, token);
		};

		try {
			const user = await prisma.user.findUnique({
				where: { email: input.email }
			});
			if (!user) {
				await createUserAndSendEmail(input);
				// set status
				ctx.status = responseStatus.SUCCESS;
			} else if (user.is_verified == false) {
				// delete user if user is not verified
				await auth.invalidateAllUserSessions(user.id);
				await prisma.user.delete({
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
			[responseStatus.SUCCESS]: { data: {} },
			[responseStatus.CONFLICT]: { message: 'Account already exists.' },
			[responseStatus.INTERNAL_SERVER_ERROR]: { message: 'Internal Server Error.' }
		});
	},
	signInEmail: async ({ ctx, input }) => {
		ctx.status = responseStatus.INTERNAL_SERVER_ERROR;
		let userSession:
			| NonNullable<Awaited<ReturnType<typeof ctx.authRequest.validate>>>['user']
			| null = null;
		let userId: string | null = null;
		try {
			// Verify Key
			const key = await auth.useKey('email', input.email, input.password);
			userId = key.userId;
		} catch (e) {
			// https://lucia-auth.com/reference/lucia-auth/auth?sveltekit#usekey
			ctx.status = responseStatus.UNAUTHORIZED;
		}
		if (userId) {
			try {
				const is_verified = (
					await prisma.user.findFirst({
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
					await auth.invalidateAllUserSessions(userId);
					const session = await auth.createSession({
						userId,
						attributes: {}
					});
					ctx.authRequest.setSession(session);
					ctx.cookies.set('auth_session', session.sessionId, {
						path: '/',
						maxAge: 60 * 60
					});
					userSession = (await ctx.authRequest.validate())?.user ?? null;

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
			[responseStatus.SUCCESS]: { data: { userSession } },
			[responseStatus.PRECONDITION_FAILED]: { message: 'Account not verified.' },
			[responseStatus.UNAUTHORIZED]: { message: 'Incorrect email or password.' },
			[responseStatus.INTERNAL_SERVER_ERROR]: { message: 'Internal Server Error.' }
		});
	},
	sendResetPasswordEmail: async ({ ctx, input }) => {
		ctx.status = responseStatus.INTERNAL_SERVER_ERROR;

		const dbUser = await prisma.user.findUnique({
			where: { email: input.email }
		});
		if (dbUser) {
			try {
				const token = await generateVerificationToken(dbUser.id);
				await sendEmailResetPassword(dbUser.email, token.toString());
				ctx.status = responseStatus.SUCCESS;
			} catch (e) {
				ctx.status = responseStatus.INTERNAL_SERVER_ERROR;
			}
		} else {
			ctx.status = responseStatus.NOT_FOUND;
		}

		return getResponse(ctx.status, {
			[responseStatus.SUCCESS]: { data: {} },
			[responseStatus.NOT_FOUND]: { message: 'No account attributed with this Email.' },
			[responseStatus.INTERNAL_SERVER_ERROR]: { message: 'Internal Server Error.' }
		});
	},
	resetPasswordEmail: async ({ ctx, input }) => {
		ctx.status = responseStatus.INTERNAL_SERVER_ERROR;
		let userSession: Awaited<ReturnType<typeof validateToken>> | null = null;
		let userKey: string | null = null;

		try {
			userSession = await validateToken(input.code ?? '');
			userKey = userSession.userId;
		} catch (e) {
			ctx.status = responseStatus.NOT_FOUND;
		}

		if (userKey) {
			try {
				if (userSession) {
					await auth.invalidateAllUserSessions(userSession.userId);
					// update key
					await auth.updateKeyPassword('email', userSession.email, input.password);
					const session = await auth.createSession({
						userId: userSession.userId,
						attributes: {}
					});
					ctx.authRequest.setSession(session);
					ctx.cookies.set('auth_session', session.sessionId, {
						path: '/',
						maxAge: 60 * 60
					});
					userSession = (await ctx.authRequest.validate())?.user ?? null;

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
			[responseStatus.SUCCESS]: { data: { userSession } },
			[responseStatus.NOT_FOUND]: { message: 'Ivalid request, please generate new reset link.' },
			[responseStatus.INTERNAL_SERVER_ERROR]: { message: 'Internal Server Error.' }
		});
	},
	signOnGoogle: async ({ ctx }) => {
		const [url, state] = await googleAuth.getAuthorizationUrl();

		ctx.cookies.set('google_oauth_state', state, {
			secure: !dev,
			path: '/',
			maxAge: 60 * 60
		});

		ctx.status = responseStatus.SUCCESS;

		return getResponse(ctx.status, {
			[responseStatus.SUCCESS]: { data: { url } }
		});
	},
	refreshUser: async ({ ctx }) => {
		const { privateCtx } = await privateProcedure(ctx);

		const userSession = privateCtx.sessionUser ?? null;

		// eslint-disable-next-line prefer-const
		ctx.status = userSession?.userId ? responseStatus.SUCCESS : responseStatus.UNAUTHORIZED;

		return getResponse(ctx.status, {
			[responseStatus.SUCCESS]: { data: { userSession } },
			[responseStatus.UNAUTHORIZED]: { message: 'User not logged in.' }
		});
	}
} satisfies APITypeB<'authRouter'>;
