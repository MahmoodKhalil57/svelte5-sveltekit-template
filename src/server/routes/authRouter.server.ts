import { dev } from '$app/environment';
import { getResponse, responseStatus, type APIType } from '$api/root.server';
import {
	createUserAndSendEmail,
	deleteUser,
	generateAndSendVerificationEmail,
	generateGoogleSignOnData,
	getAuthUserByEmail,
	invalidateSession,
	loginEmailPassword,
	sessionCookieName,
	updateUserPassword,
	verifyEmailPassword,
	validatAuthUserToken,
	verifyAuthUserEmail,
	continueWithGoogle
} from '$api/controllers/authController.server';
import { redirect } from '@sveltejs/kit';

export default {
	signOnGoogle: async ({ ctx, privateCtx }) => {
		ctx.status = responseStatus.INTERNAL_SERVER_ERROR;

		const googleSignOnData = await generateGoogleSignOnData();
		const { state, codeVerifier, redirectUrl } = googleSignOnData ?? {};

		if (codeVerifier && state) {
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

		if (ctx.status === responseStatus.SUCCESS && redirectUrl?.toString()) {
			redirect(302, redirectUrl?.toString());
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
		let userAttributes: Awaited<ReturnType<typeof loginEmailPassword>>['user'] | null = null;
		try {
			const verifiedUser = await verifyEmailPassword(input.email, input.password);
			if (verifiedUser) {
				if (verifiedUser.is_verified) {
					const unloggedId = ctx.cookies.get('unloggedinSession');

					const loginEmailPasswordRes = await loginEmailPassword(verifiedUser.id, unloggedId);
					userAttributes = loginEmailPasswordRes.user;
					ctx.cookies.set(sessionCookieName, loginEmailPasswordRes.session.id, {
						path: '/',
						maxAge: 60 * 60
					});

					ctx.status = responseStatus.SUCCESS;
				} else {
					ctx.status = responseStatus.PRECONDITION_FAILED;
				}
			}
		} catch (e) {
			// https://lucia-auth.com/reference/lucia-auth/auth?sveltekit#usekey
			ctx.status = responseStatus.UNAUTHORIZED;
		}

		return getResponse(ctx.status, {
			[responseStatus.SUCCESS]: {
				stores: { userAttributes: { set: userAttributes } }
			},
			[responseStatus.PRECONDITION_FAILED]: { message: 'Account not verified.' },
			[responseStatus.UNAUTHORIZED]: { message: 'Incorrect email or password.' },
			[responseStatus.INTERNAL_SERVER_ERROR]: { message: 'Internal Server Error.' }
		});
	},
	signUpEmail: async ({ ctx, privateCtx, input }) => {
		ctx.status = responseStatus.INTERNAL_SERVER_ERROR;
		const ipAddress = ctx.request.headers.get('x-forwarded-for') || ctx.getClientAddress();

		try {
			const user = await getAuthUserByEmail(input.email);
			if (!user) {
				await createUserAndSendEmail(
					input.firstName,
					input.lastName,
					input.email,
					input.password,
					'',
					false,
					false,
					ipAddress
				);
				// set status
				ctx.status = responseStatus.SUCCESS;
			} else if (user.is_verified == false) {
				await deleteUser(user);

				await createUserAndSendEmail(
					input.firstName,
					input.lastName,
					input.email,
					input.password,
					'',
					false,
					false,
					ipAddress
				);
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
			if (await validatAuthUserToken(input.code.trim())) {
				ctx.status = responseStatus.SUCCESS;
			}
		} catch (e) {
			console.log('🚀 ~ verifyCode: ~ e:', e);
		}

		return getResponse(ctx.status, {
			[responseStatus.SUCCESS]: {
				data: { code: input.code },
				stores: { userAttributes: { set: privateCtx.userAttributes } },
				clientRedirect: '/api/authRouter/emailCallback?code=' + input.code.trim()
			},
			[responseStatus.NOT_FOUND]: { message: 'No account attributed with this Email.' },
			[responseStatus.INTERNAL_SERVER_ERROR]: { message: 'Internal Server Error.' }
		});
	},
	signOut: async ({ ctx }) => {
		const sessionToken = ctx.cookies.get(sessionCookieName) ?? '';
		await invalidateSession(sessionToken);

		ctx.cookies.set(sessionCookieName, '', {
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

		const authUser = await getAuthUserByEmail(input.email);
		if (authUser) {
			try {
				await generateAndSendVerificationEmail(authUser);
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
			if (await validatAuthUserToken(input.code.trim())) {
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
		let userAttributes: Awaited<ReturnType<typeof validatAuthUserToken>> | null = null;

		try {
			userAttributes = await validatAuthUserToken(input.code ?? '', true);
		} catch (e) {
			ctx.status = responseStatus.NOT_FOUND;
		}

		if (userAttributes) {
			try {
				if (userAttributes) {
					const updateUserPasswordResonse = await updateUserPassword(
						userAttributes,
						input.password
					);

					userAttributes = updateUserPasswordResonse.user;

					ctx.cookies.set(sessionCookieName, updateUserPasswordResonse.session.id, {
						path: '/',
						maxAge: 60 * 60
					});

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
				stores: { userAttributes: { set: userAttributes } }
			},
			[responseStatus.NOT_FOUND]: { message: 'Ivalid request, please generate new reset link.' },
			[responseStatus.INTERNAL_SERVER_ERROR]: { message: 'Internal Server Error.' }
		});
	},
	refreshUser: async ({ ctx, privateCtx }) => {
		let userAttributes = privateCtx.userAttributes;
		ctx.status = responseStatus.SUCCESS;

		return getResponse(ctx.status, {
			[responseStatus.SUCCESS]: {
				stores: { userAttributes: { set: userAttributes } },
				clientRedirect: ''
			}
		});
	},
	emailCallback: async ({ ctx, privateCtx, input }) => {
		if (!privateCtx.userAttributes?.id) {
			try {
				const unloggedId = ctx.cookies.get('unloggedinSession') as string | undefined;
				const verifyAuthUserEmailResponse = await verifyAuthUserEmail(input.code, unloggedId);
				if (verifyAuthUserEmailResponse?.session) {
					ctx.cookies.set(sessionCookieName, verifyAuthUserEmailResponse.session.id, {
						path: '/',
						maxAge: 60 * 60
					});
				}
			} catch (e) {
				// invalid code
				return { body: { message: 'Invalid code' }, status: responseStatus.UNAUTHORIZED };
			}
		}
		redirect(302, '/');
	},
	googleCallback: async ({ ctx, privateCtx, input }) => {
		let session = undefined;
		let userAttributes = privateCtx.userAttributes;
		const codeVerifierCookie = ctx.cookies.get('google_oauth_code_verifier') ?? '';
		const storedState = ctx.cookies.get('google_oauth_state');
		const ipAddress = ctx.request.headers.get('x-forwarded-for') || ctx.getClientAddress();
		const unloggedId = ctx.cookies.get('unloggedinSession');

		if (!userAttributes) {
			const continueWithGoogleResponse = await continueWithGoogle(
				storedState,
				codeVerifierCookie,
				input.state,
				input.code,
				unloggedId,
				ipAddress
			);
			session = continueWithGoogleResponse.session;
			userAttributes = continueWithGoogleResponse.user;
		}

		if (session) {
			ctx.cookies.set(sessionCookieName, session.id, {
				path: '/',
				maxAge: 60 * 60
			});
		}

		redirect(302, '/closetab');
	}
} satisfies APIType['authRouter'];
