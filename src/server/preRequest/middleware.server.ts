// import type { getContext } from '$api/preRequest/context.server';
// import { prisma } from '$api/clients/prisma.server';
// import { customAlphabet } from 'nanoid';
// import type { AuthRequest } from 'lucia';
// import { responseStatus, throwError } from '$lib/apiUtils/server/apiUtils.server';

// const getUser = async (localAuth: AuthRequest) => {
// 	const currentUser = (await localAuth.validate())?.user;

// 	const currentUser = await prisma.authSession
// 		.findUnique({
// 			where: {
// 				id: sessionToken
// 			}
// 		})
// 		.auth_user();

// 	return currentUser;
// };

export const hybridUserProcedure = async (ctx: unknown) => {
	return { ctx };
};
// export const hybridUserProcedure = async (ctx: Awaited<ReturnType<typeof getContext>>) => {
// 	return { ctx };

// 	// To get hybridUserId
// 	// 1. checked logged in user, if exists, get hybridUserId
// 	// 2. if not, check unlogged user, if exists, get hybridUserId
// 	// 3. if not, create unlogged user, get hybridUserId
// 	let hybridUserId: string;

// 	// 1. check logged in user
// 	const sessionUser = await getUser(ctx.authRequest);
// 	const loggedId = sessionUser?.userId;
// 	if (loggedId) {
// 		// if logged user, get hybridUserId (if it doesnt exist create it, thats why we use upsert)
// 		const loggedUserRowIndepth = await prisma.authUser.update({
// 			where: {
// 				id: loggedId
// 			},
// 			data: {
// 				HybridUserData: {
// 					upsert: {
// 						create: {},
// 						update: {}
// 					}
// 				}
// 			},
// 			select: {
// 				HybridUserData: {
// 					select: {
// 						id: true
// 					}
// 				}
// 			}
// 		});

// 		hybridUserId = loggedUserRowIndepth.HybridUserData?.id as string;
// 	} else {
// 		let unloggedUserRowIndepth: {
// 			UserData: {
// 				id: string;
// 			} | null;
// 		} | null = null;

// 		// 2. check unlogged user
// 		let unloggedId = ctx.cookies.get('unloggedinSession');
// 		if (unloggedId) {
// 			unloggedUserRowIndepth = await prisma.unloggedUser.findFirst({
// 				where: {
// 					id: unloggedId
// 				},
// 				select: {
// 					UserData: {
// 						select: {
// 							id: true
// 						}
// 					}
// 				}
// 			});
// 		}
// 		if (!unloggedUserRowIndepth) {
// 			// 3. create unlogged user
// 			unloggedId = customAlphabet('1234567890abcdefghijklmnopqrstuvwxyz', 10)();
// 			unloggedUserRowIndepth = await prisma.unloggedUser.create({
// 				data: {
// 					id: unloggedId,
// 					UserData: {
// 						create: {}
// 					}
// 				},
// 				select: {
// 					UserData: {
// 						select: {
// 							id: true
// 						}
// 					}
// 				}
// 			});
// 			const maxAge = 60 * 60 * 24 * 365 * 10;
// 			ctx.cookies.set('unloggedinSession', unloggedId, {
// 				path: '/',
// 				maxAge
// 			});
// 		}

// 		hybridUserId = unloggedUserRowIndepth?.UserData?.id as string;
// 	}

// 	// checks if hybridUserId exists just in case user tried to inject it
// 	return { hybridCtx: { sessionUser, hybridUserId }, ctx };
// };

export const privateProcedure = async (ctx: unknown) => {
	return { ctx };
};
// export const privateProcedure = async (ctx: Awaited<ReturnType<typeof getContext>>) => {

// 	const sessionUser = await getUser(ctx.authRequest);
// 	// const sessionUser = ctx.locals.auth.validateUser();

// 	if (sessionUser && sessionUser.is_verified) {
// 		return { privateCtx: { sessionUser }, ctx };
// 	}

// 	throwError(responseStatus.FORBIDDEN);
// 	return { privateCtx: { sessionUser: sessionUser as NonNullable<typeof sessionUser> }, ctx };
// };

export const adminProcedure = async (ctx: unknown) => {
	return { ctx };
};

// export const adminProcedure = async (ctx: Awaited<ReturnType<typeof getContext>>) => {
// 	const previousCtx = await privateProcedure(ctx);
// 	if (!previousCtx.privateCtx.sessionUser?.is_admin) {
// 		throwError(responseStatus.FORBIDDEN);
// 	}
// 	const nextCtx = { is_admin: true };
// 	return { ...previousCtx, adminCtx: nextCtx };
// };
