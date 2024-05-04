import { Lucia } from 'lucia';
import { PrismaAdapter } from '@lucia-auth/adapter-prisma';
import { prisma } from '$api/clients/prisma.server';
import env from '$e';
import { customAlphabet, urlAlphabet } from 'nanoid';
import { webcrypto } from 'node:crypto';
import { Google } from 'arctic';

const urlAlphabetGenerator = customAlphabet(urlAlphabet, 21);

if (!globalThis.crypto) {
	globalThis.crypto = webcrypto as Crypto;
}

const adapter = new PrismaAdapter(prisma.authSession, prisma.authUser);

export const getUserAttributes = (databaseUser: DatabaseUserAttributes) => {
	return {
		id: databaseUser.id,
		username: databaseUser.username,
		firstName: databaseUser.firstName,
		lastName: databaseUser.lastName,
		email: databaseUser.email,
		profilePicture: databaseUser.profilePicture,
		is_verified: databaseUser.is_verified,
		is_admin: databaseUser.is_admin
	};
};

export const auth = new Lucia(adapter, {
	sessionCookie: {
		expires: false,
		attributes: {
			secure: process.env.NODE_ENV === 'production'
		}
	},
	getUserAttributes
});

export type Auth = typeof auth;

const GOOGLE_ID = env.GOOGLE_ID();
const GOOGLE_SECRET = env.GOOGLE_SECRET();
const WEBSITE_URL = env.WEBSITE_URL();
export const googleAuth =
	GOOGLE_ID && GOOGLE_SECRET && WEBSITE_URL
		? new Google(GOOGLE_ID, GOOGLE_SECRET, WEBSITE_URL + '/api/authRouter/googleCallback')
		: undefined;

// export const emailVerificationToken = idToken(auth, 'email_verification', {
// 	expiresIn: 60 * 60 // 1 hour
// });

// export const passwordResetToken = idToken(auth, 'password-reset', {
// 	expiresIn: 60 * 60 // 1 hour
// });

const EXPIRES_IN = 1000 * 60 * 60 * 2; // 2 hours

// validates token and returns user id if valid
export const validateToken = async (token: string) => {
	const storedUserToken = (
		await prisma.authToken.findMany({
			where: {
				id: token,
				created: {
					gte: new Date(new Date().getTime() - EXPIRES_IN)
				}
			}
		})
	)[0];
	if (!storedUserToken) throw new Error('Invalid token');
	await prisma.authToken.delete({
		where: {
			id: token
		}
	});

	const userRecord = await prisma.authUser.findUnique({
		where: {
			id: storedUserToken.user_id
		}
	});

	const luciaUser = getUserAttributes(userRecord!);
	return luciaUser;
};

export const generateVerificationToken = async (userId: string) => {
	let storedUserToken = (
		await prisma.authToken.findMany({
			where: {
				user_id: userId,
				created: {
					gte: new Date(new Date().getTime() - EXPIRES_IN)
				}
			}
		})
	)[0];
	if (storedUserToken) {
		return storedUserToken.id;
	}

	// you can optionally invalidate all user tokens
	// so only a single valid token exists per user
	// for high security apps

	const token = urlAlphabetGenerator();
	storedUserToken = await prisma.authToken.create({
		data: {
			id: token,
			authUser: {
				connect: {
					id: userId
				}
			}
		}
	});
	return storedUserToken.id;
};

declare module 'lucia' {
	interface Register {
		Lucia: typeof auth;
		DatabaseUserAttributes: DatabaseUserAttributes;
	}
}

interface DatabaseUserAttributes {
	id: string;
	username: string;
	firstName: string;
	lastName: string;
	email: string;
	profilePicture: string;
	is_verified: boolean;
	is_admin: boolean;
}
