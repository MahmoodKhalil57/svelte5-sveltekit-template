import { type APIType, responseStatus } from '$api/root.server';
import { prisma } from '$api/clients/prisma.server';
import { auth, googleAuth, validateToken } from '$api/clients/luciaClient.server';
import { transferUserData } from '$api/controllers/userData.server';
import { redirect } from '@sveltejs/kit';
import { nanoid, customAlphabet } from 'nanoid';
import { parseJWT } from 'oslo/jwt';

let alphanumericGenerator = customAlphabet(
	'0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz',
	10
);

interface GoogleUserResult {
	iss: string;
	azp: string;
	aud: string;
	sub: string;
	email: string;
	email_verified: boolean;
	at_hash: string;
	nonce: string;
	name: string;
	picture: string;
	given_name: string;
	family_name: string;
	iat: number;
	exp: number;
}
export default {
	email: async ({ ctx, privateCtx, input }) => {
		if (!privateCtx.userAttributes?.id) {
			try {
				const user = await validateToken(input.code);
				if (user) {
					await prisma.authUser.update({
						where: {
							id: user.id
						},
						data: {
							is_verified: true
						}
					});

					const session = await auth.createSession(user.id, {});
					ctx.cookies.set(auth.sessionCookieName, session.id, {
						path: '/',
						maxAge: 60 * 60
					});
					const unloggedId = ctx.cookies.get('unloggedinSession');
					if (unloggedId) {
						await transferUserData(prisma, user.id, unloggedId);
					}
				}
			} catch (e) {
				// invalid code
				return { body: { message: 'Invalid code' }, status: responseStatus.UNAUTHORIZED };
			}
		}
		redirect(302, '/');
	},
	google: async ({ ctx, privateCtx, input }) => {
		const user = privateCtx.userAttributes;
		const codeVerifierCookie = ctx.cookies.get('google_oauth_code_verifier') ?? '';
		const storedState = ctx.cookies.get('google_oauth_state');
		const ipAddress = ctx.request.headers.get('x-forwarded-for') || ctx.getClientAddress();

		if (!user && storedState === input.state && googleAuth !== undefined) {
			const tokens = await googleAuth.validateAuthorizationCode(input.code, codeVerifierCookie);
			const googleUserResult = parseJWT(tokens.idToken)!.payload as GoogleUserResult;

			const getUser = async () => {
				try {
					const existingUser = await prisma.authUser.findFirst({
						where: {
							email: googleUserResult.email
						}
					});
					if (existingUser) {
						if (existingUser.is_verified) {
							// user is already verified
							return existingUser;
						} else {
							// delete user
							await auth.invalidateSession(existingUser.id);
							await prisma.authKey.deleteMany({
								where: {
									authUser: {
										id: existingUser.id
									}
								}
							});
							await prisma.authToken.deleteMany({
								where: {
									authUser: {
										id: existingUser.id
									}
								}
							});
							await prisma.authUser.delete({
								where: {
									id: existingUser.id
								}
							});
						}
					}
				} catch (e) {
					// console.log('🚀 ~ getUser ~ e:', e);
				}

				// create a new user if the user does not exist
				const [firstName, lastName] = googleUserResult.name.split(' ');

				const userNameAvailable =
					googleUserResult.name &&
					(
						await prisma.authUser.findUnique({
							where: {
								username: googleUserResult.name
							},
							select: {
								username: true
							}
						})
					)?.username !== undefined;

				const newUser = await prisma.authUser.create({
					data: {
						id: nanoid(),
						username: userNameAvailable ? googleUserResult.name : alphanumericGenerator(10),
						firstName: firstName ?? '',
						lastName: lastName ?? '',
						email: googleUserResult.email ?? '',
						profilePicture: googleUserResult.picture ?? '',
						is_verified: true,
						is_admin: false,
						ipAddress
					}
				});
				return newUser;
			};
			const loggedUser = await getUser();
			const session = await auth.createSession(loggedUser.id, {});
			ctx.cookies.set(auth.sessionCookieName, session.id, {
				path: '/',
				maxAge: 60 * 60
			});

			const unloggedId = ctx.cookies.get('unloggedinSession');
			if (unloggedId) {
				await transferUserData(prisma, loggedUser.id, unloggedId);
			}
		}
		redirect(302, '/');
	}
} satisfies APIType['callback'];
