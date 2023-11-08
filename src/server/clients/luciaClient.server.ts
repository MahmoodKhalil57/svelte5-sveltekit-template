// import { lucia } from 'lucia';
// import { sveltekit } from 'lucia/middleware';
// import { prisma } from '@lucia-auth/adapter-prisma';
// import { google } from '@lucia-auth/oauth/providers';
// import { prisma as prismaClient } from '$api/clients/prisma.server';
// import env from '$e';
// import { customAlphabet } from 'nanoid';

// export const auth = lucia({
// 	adapter: prisma(prismaClient, {
// 		user: 'authUser', // model User {}
// 		key: 'authKey', // model Key {}
// 		session: 'authSession' // model Session {}
// 	}),
// 	env: 'DEV',
// 	middleware: sveltekit(),
// 	getUserAttributes: (databaseUser) => {
// 		return {
// 			userId: databaseUser.id,
// 			username: databaseUser.username,
// 			firstName: databaseUser.firstName,
// 			lastName: databaseUser.lastName,
// 			email: databaseUser.email,
// 			profilePicture: databaseUser.profilePicture,
// 			is_verified: databaseUser.is_verified,
// 			is_admin: databaseUser.is_admin
// 		};
// 	}
// });

// export type Auth = typeof auth;

// export const googleAuth = google(auth, {
// 	clientId: env.GOOGLE_ID(),
// 	clientSecret: env.GOOGLE_SECRET(),
// 	redirectUri: env.WEBSITE_URL() + '/callback/google',
// 	scope: ['email', 'profile']
// });

// // export const emailVerificationToken = idToken(auth, 'email_verification', {
// // 	expiresIn: 60 * 60 // 1 hour
// // });

// // export const passwordResetToken = idToken(auth, 'password-reset', {
// // 	expiresIn: 60 * 60 // 1 hour
// // });

// const EXPIRES_IN = 1000 * 60 * 60 * 2; // 2 hours

// // validates token and returns user id if valid
// export const validateToken = async (token: string) => {
// 	let storedUserToken = (
// 		await prismaClient.authToken.findMany({
// 			where: {
// 				id: token,
// 				created: {
// 					gte: new Date(new Date().getTime() - EXPIRES_IN)
// 				}
// 			}
// 		})
// 	)[0];
// 	if (!storedUserToken) throw new Error('Invalid token');
// 	await prismaClient.authToken.delete({
// 		where: {
// 			id: token
// 		}
// 	});
// 	return auth.getUser(storedUserToken.user_id);
// };

// export const generateVerificationToken = async (userId: string) => {
// 	let storedUserToken = (
// 		await prismaClient.authToken.findMany({
// 			where: {
// 				user_id: userId,
// 				created: {
// 					gte: new Date(new Date().getTime() - EXPIRES_IN)
// 				}
// 			}
// 		})
// 	)[0];
// 	if (storedUserToken) {
// 		return storedUserToken.id;
// 	}

// 	// you can optionally invalidate all user tokens
// 	// so only a single valid token exists per user
// 	// for high security apps

// 	const token = customAlphabet('1234567890abcdefghijklmnopqrstuvwxyz', 10)();
// 	storedUserToken = await prismaClient.authToken.create({
// 		data: {
// 			id: token,
// 			auth_user: {
// 				connect: {
// 					id: userId
// 				}
// 			}
// 		}
// 	});
// 	return storedUserToken.id;
// };
