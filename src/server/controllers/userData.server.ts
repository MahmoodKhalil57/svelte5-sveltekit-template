import type { prisma } from '$api/clients/prisma.server';

export const transferUserData = async (
	p: typeof prisma,
	loggedUserId: string,
	unloggedUserId: string
) => {
	const userData = await p.authUser.findFirst({
		where: {
			id: loggedUserId
		}
	}).hybridUser;
	if (!userData) {
		try {
			await p.hybridUser.update({
				where: {
					unloggedUserId: unloggedUserId
				},
				data: {
					unloggedUser: {
						disconnect: true
					},
					AuthUser: {
						connect: {
							id: loggedUserId
						}
					}
				}
			});
		} catch (e) {
			// console.log('🚀 ~ file: userData.server.ts:33 ~ e:', e);
		}
	}
};
