import { prisma } from '$api/clients/prisma.server';
import type { APITypeB } from '$lib/apiUtils/server/ApiUtils.type.server';
import { auth, googleAuth, validateToken } from '$api/clients/luciaClient.server';
import { transferUserData } from '$api/controllers/userData.server';
import { redirect } from '@sveltejs/kit';
import { responseStatus } from '$lib/utils/serverResponse';
import { nanoid } from 'nanoid';

export default {
	email: async ({ ctx, input }) => {
		const user = (await ctx.authRequest.validate())?.user;
		if (!user) {
			try {
				const user = await validateToken(input.code);
				if (user) {
					await auth.updateUserAttributes(user.userId, {
						is_verified: true
					});
					const session = await auth.createSession({ userId: user.userId, attributes: {} });
					ctx.authRequest.setSession(session);
					const unloggedId = ctx.cookies.get('unloggedinSession');
					if (unloggedId) {
						await transferUserData(prisma, user.userId, unloggedId);
					}
				}
			} catch (e) {
				// invalid code
				return { body: { message: 'Invalid code' }, status: responseStatus.BAD_REQUEST };
			}
		}
		throw redirect(302, '/');
	},
	google: async ({ ctx, input }) => {
		const user = (await ctx.authRequest.validate())?.user;
		const storedState = ctx.cookies.get('google_oauth_state');

		if (!user && storedState === input.state) {
			const { getExistingUser, googleUser, createUser } = await googleAuth.validateCallback(
				input.code
			);
			const getUser = async () => {
				try {
					const existingUser = await getExistingUser();
					if (existingUser) {
						if (existingUser.is_verified) {
							// user is already verified
							return existingUser;
						} else {
							// delete user
							await auth.deleteUser(existingUser.userId);
						}
					}
				} catch (e) {
					console.log('🚀 ~ file: +server.ts:54 ~ getUser ~ e:', e);
				}

				// create a new user if the user does not exist
				const [firstName, lastName] = googleUser.name.split(' ');

				const userNameAvailable =
					googleUser.name &&
					(
						await prisma.user.findUnique({
							where: {
								username: googleUser.name
							},
							select: {
								username: true
							}
						})
					)?.username !== undefined;

				const newUser = await createUser({
					attributes: {
						// attributes
						username: userNameAvailable ? googleUser.name : nanoid(10),
						firstName: firstName ?? '',
						lastName: lastName ?? '',
						email: googleUser.email ?? '',
						is_verified: true,
						is_admin: false
					}
				});
				return newUser;
			};
			const loggedUser = await getUser();
			const session = await auth.createSession({ userId: loggedUser.userId, attributes: {} });
			ctx.authRequest.setSession(session);

			const unloggedId = ctx.cookies.get('unloggedinSession');
			if (unloggedId) {
				await transferUserData(prisma, loggedUser.userId, unloggedId);
			}
		}
		throw redirect(302, '/');
	}
} satisfies APITypeB<'callback'>;
