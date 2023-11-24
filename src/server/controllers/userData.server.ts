// import type { prisma } from '$api/clients/prisma.server';

// export const transferUserData = async (
// 	p: typeof prisma,
// 	loggedUserId: string,
// 	unloggedUserId: string
// ) => {
// 	const userData = await p.authUser
// 		.findFirst({
// 			where: {
// 				id: loggedUserId
// 			}
// 		})
// 		.HybridUserData();
// 	if (!userData) {
// 		try {
// 			await p.hybridUserData.update({
// 				where: {
// 					unloggedUserId: unloggedUserId
// 				},
// 				data: {
// 					UnloggedUser: {
// 						disconnect: true
// 					},
// 					AuthUser: {
// 						connect: {
// 							id: loggedUserId
// 						}
// 					}
// 				}
// 			});
// 		} catch (e) {
// 			// console.log('🚀 ~ file: userData.server.ts:33 ~ e:', e);
// 		}
// 	}
// };
