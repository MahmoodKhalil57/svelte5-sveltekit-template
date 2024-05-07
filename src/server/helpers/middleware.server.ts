import { responseStatus } from '$api/root.server';
import { throwError } from '$apiUtils/server/apiUtils.server';
import type { MiddlewareMap } from '$apiUtils/server/ApiUtils.type.server';
import type { getContext } from '$api/helpers/context.server';
import { dev } from '$app/environment';
import type { HybridUser } from '@prisma/client';
import { auth } from '$api/clients/luciaClient.server';
import type { User } from 'lucia';
import { prisma } from '$api/clients/prisma.server';
import { customAlphabet, urlAlphabet } from 'nanoid';
import { logData } from './logger.server';

const urlAlphabetGenerator = customAlphabet(urlAlphabet, 21);

export const middlewareMap = {
	hybridUserProcedure: async function (ctx) {
		// To get hybridUserId
		// 1. checked logged in user, if exists, get hybridUserId
		// 2. if not, check unlogged user, if exists, get hybridUserId
		// 3. if not, create unlogged user, get hybridUserId
		let hybridUser: HybridUser;
		let userAttributes: User | null = null;

		const ipAddress = ctx.request.headers.get('x-forwarded-for') || ctx.getClientAddress();

		// 1. check logged in user
		const authSessionId = ctx.cookies.get(auth.sessionCookieName);
		if (authSessionId) {
			const { user } = await auth.validateSession(authSessionId);
			userAttributes = user;
		}
		if (userAttributes) {
			// if logged user, get hybridUserId (if it doesnt exist create it, thats why we use upsert)
			const loggedUserRowIndepth = await prisma.authUser.update({
				where: {
					id: userAttributes.id
				},
				data: {
					hybridUser: {
						upsert: {
							create: {},
							update: {}
						}
					}
				},
				select: {
					hybridUser: true
				}
			});

			hybridUser = loggedUserRowIndepth.hybridUser!;
		} else {
			let unloggedUserRowIndepth: {
				hybridUser: HybridUser | null;
			} | null = null;

			// 2. check unlogged user
			let unloggedId = ctx.cookies.get('unloggedinSession');
			if (unloggedId) {
				unloggedUserRowIndepth = await prisma.unloggedUser.findFirst({
					where: {
						id: unloggedId
					},
					select: {
						hybridUser: true
					}
				});
			}
			if (!unloggedUserRowIndepth) {
				// 3. create unlogged user
				unloggedId = urlAlphabetGenerator();
				unloggedUserRowIndepth = await prisma.unloggedUser.create({
					data: {
						id: unloggedId,
						ipAddress,
						hybridUser: {
							create: {}
						}
					},
					select: {
						hybridUser: true
					}
				});
				const maxAge = 60 * 60 * 24 * 365 * 10;
				ctx.cookies.set('unloggedinSession', unloggedId, {
					path: '/',
					maxAge
				});
			}

			hybridUser = unloggedUserRowIndepth?.hybridUser!;
		}

		logData.info({
			codeLocation: '🚀 ~ hybridUser:',
			identifier: hybridUser?.id
		});

		// checks if hybridUserId exists just in case user tried to inject it
		return { hybridCtx: { hybridUser }, privateCtx: { userAttributes }, ctx };
	},
	privateProcedure: async function (ctx) {
		let userAttributes: User | null | undefined;
		const authSessionId = ctx.cookies.get(auth.sessionCookieName);
		if (authSessionId) {
			const { user } = await auth.validateSession(authSessionId);
			userAttributes = user;
		}
		let hybridUser: HybridUser | undefined;
		if (userAttributes && userAttributes.is_verified) {
			hybridUser = (await prisma.hybridUser.findUnique({
				where: {
					loggedUserId: userAttributes?.id
				}
			}))!;

			logData.info({
				codeLocation: '🚀 ~ hybridUser:',
				identifier: hybridUser?.id
			});
			return { privateCtx: { userAttributes: userAttributes }, hybridCtx: { hybridUser }, ctx };
		}

		throwError(responseStatus.FORBIDDEN);
		return {
			privateCtx: { userAttributes: userAttributes as NonNullable<typeof userAttributes> },
			hybridCtx: { hybridUser: hybridUser as NonNullable<typeof hybridUser> },
			ctx
		};
	},
	adminProcedure: async function (ctx) {
		const privateProcedure = this.privateProcedure as MiddlewareMap<
			Awaited<ReturnType<typeof getContext>>
		>['privateProcedure'];
		const previousCtx = (await privateProcedure(ctx)) as any as {
			privateCtx: { userAttributes: User };
		};
		if (!previousCtx.privateCtx.userAttributes?.is_admin) {
			throwError(responseStatus.FORBIDDEN);
		}
		const nextCtx = { is_admin: true };
		return { ...previousCtx, adminCtx: nextCtx, ctx };
	},
	devProcedure: async function (ctx) {
		if (!dev) {
			throwError(responseStatus.FORBIDDEN);
		}

		logData.info({
			codeLocation: '🚀 ~ hybridUser:',
			identifier: 'developer'
		});
		return { ctx };
	}
} satisfies MiddlewareMap<Awaited<ReturnType<typeof getContext>>>;
