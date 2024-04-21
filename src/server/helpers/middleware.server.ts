import { responseStatus } from '$api/root.server';
import { throwError } from '$apiUtils/server/apiUtils.server';
import type { MiddlewareMap } from '$apiUtils/server/ApiUtils.type.server';
import type { getContext } from '$api/helpers/context.server';
import { dev } from '$app/environment';
// import crypto from 'crypto';

export const middlewareMap = {
	// hybridUserProcedure: async function (ctx) {
	// 	// To get hybridUserId
	// 	// 1. checked logged in user, if exists, get hybridUserId
	// 	// 2. if not, check unlogged user, if exists, get hybridUserId
	// 	// 3. if not, create unlogged user, get hybridUserId
	// 	let hybridUser: HybridUserData;
	// 	let loggedId: string | undefined;
	// 	let sessionUser: User | null = null;

	// 	const ipAddress = ctx.request.headers.get('x-forwarded-for') || ctx.getClientAddress();

	// 	// 1. check logged in user
	// 	const authSessionId = ctx.cookies.get(auth.sessionCookieName);
	// 	if (authSessionId) {
	// 		const { user } = await auth.validateSession(authSessionId);
	// 		sessionUser = user;
	// 		loggedId = user?.id;
	// 	}
	// 	if (loggedId) {
	// 		// if logged user, get hybridUserId (if it doesnt exist create it, thats why we use upsert)
	// 		const loggedUserRowIndepth = await prisma.user.update({
	// 			where: {
	// 				id: loggedId
	// 			},
	// 			data: {
	// 				hybridUserData: {
	// 					upsert: {
	// 						create: {},
	// 						update: {}
	// 					}
	// 				}
	// 			},
	// 			select: {
	// 				hybridUserData: true
	// 			}
	// 		});

	// 		hybridUser = loggedUserRowIndepth.hybridUserData!;
	// 	} else {
	// 		let unloggedUserRowIndepth: {
	// 			userData: HybridUserData | null;
	// 		} | null = null;

	// 		// 2. check unlogged user
	// 		let unloggedId = ctx.cookies.get('unloggedinSession');
	// 		if (unloggedId) {
	// 			unloggedUserRowIndepth = await prisma.unloggedUser.findFirst({
	// 				where: {
	// 					id: unloggedId
	// 				},
	// 				select: {
	// 					userData: true
	// 				}
	// 			});
	// 		}
	// 		if (!unloggedUserRowIndepth) {
	// 			// 3. create unlogged user
	// 			unloggedId = customAlphabet('1234567890abcdefghijklmnopqrstuvwxyz', 10)();
	// 			unloggedUserRowIndepth = await prisma.unloggedUser.create({
	// 				data: {
	// 					id: unloggedId,
	// 					ipAddress,
	// 					userData: {
	// 						create: {}
	// 					}
	// 				},
	// 				select: {
	// 					userData: true
	// 				}
	// 			});
	// 			const maxAge = 60 * 60 * 24 * 365 * 10;
	// 			ctx.cookies.set('unloggedinSession', unloggedId, {
	// 				path: '/',
	// 				maxAge
	// 			});
	// 		}

	// 		hybridUser = unloggedUserRowIndepth?.userData!;
	// 	}

	// 	// checks if hybridUserId exists just in case user tried to inject it
	// 	return { hybridCtx: { hybridUser }, privateCtx: { sessionUser }, ctx };
	// },
	// privateProcedure: async function (ctx) {
	// 	let sessionUser: User | null | undefined;
	// 	const authSessionId = ctx.cookies.get(auth.sessionCookieName);
	// 	if (authSessionId) {
	// 		const { user } = await auth.validateSession(authSessionId);
	// 		sessionUser = user;
	// 	}
	// 	let hybridUser: HybridUserData | undefined;
	// 	if (sessionUser && sessionUser.is_verified) {
	// 		hybridUser = (await prisma.hybridUserData.findUnique({
	// 			where: {
	// 				loggedUserId: sessionUser?.id
	// 			}
	// 		}))!;
	// 		return { privateCtx: { sessionUser }, hybridCtx: { hybridUser }, ctx };
	// 	}

	// 	throwError(responseStatus.FORBIDDEN);
	// 	return {
	// 		privateCtx: { sessionUser: sessionUser as NonNullable<typeof sessionUser> },
	// 		hybridCtx: { hybridUser: hybridUser as NonNullable<typeof hybridUser> },
	// 		ctx
	// 	};
	// },
	// adminProcedure: async function (ctx) {
	// 	const privateProcedure = this.privateProcedure as MiddlewareMap<
	// 		Awaited<ReturnType<typeof getContext>>
	// 	>['privateProcedure'];
	// 	const previousCtx = (await privateProcedure(ctx)) as any as {
	// 		privateCtx: { sessionUser: User };
	// 	};
	// 	if (!previousCtx.privateCtx.sessionUser?.is_admin) {
	// 		throwError(responseStatus.FORBIDDEN);
	// 	}
	// 	const nextCtx = { is_admin: true };
	// 	return { ...previousCtx, adminCtx: nextCtx, ctx };
	// },
	devProcedure: async function (ctx) {
		if (!dev) {
			throwError(responseStatus.FORBIDDEN);
		}
		return { ctx };
	}
} satisfies MiddlewareMap<Awaited<ReturnType<typeof getContext>>>;
