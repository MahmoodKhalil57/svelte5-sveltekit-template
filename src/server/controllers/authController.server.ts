import {
	auth,
	generateVerificationToken,
	getUserAttributes,
	googleAuth,
	validateToken
} from '$api/clients/luciaClient.server';
import { prisma, type PrismaModels } from '$api/clients/prisma.server';
import { generateCodeVerifier, generateState } from 'arctic';
import { Argon2id } from 'oslo/password';
import { transferUserData } from './userData.server';
import type { User } from 'lucia';
import { customAlphabet, nanoid } from 'nanoid';
import {
	sendEmailResetPassword,
	sendEmailVerificationEmail
} from '$api/clients/mailerClient.server';
import { parseJWT } from 'oslo/jwt';

export const validatAuthUserToken = async (token: string, invalidate = false) => {
	if (invalidate) {
		return validateToken(token);
	} else {
		return (
			await prisma.authToken.findUnique({
				where: {
					id: token
				},
				select: {
					authUser: true
				}
			})
		)?.authUser;
	}
};

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

export const sessionCookieName = auth.sessionCookieName;

export const generateGoogleSignOnData = async () => {
	let googleSignOnData:
		| {
				state: string;
				codeVerifier: string;
				redirectUrl: URL;
		  }
		| undefined = undefined;
	if (googleAuth !== undefined) {
		const state = generateState();
		const codeVerifier = generateCodeVerifier();
		googleSignOnData = {
			state,
			codeVerifier,
			redirectUrl: await googleAuth.createAuthorizationURL(state, codeVerifier, {
				scopes: ['email', 'profile']
			})
		};
	}
	return googleSignOnData;
};

export const verifyEmailPassword = async (email: string, password: string) => {
	let verifiedUser: PrismaModels['AuthUser'] | undefined = undefined;
	const latestAuthKeyRecord = await prisma.authKey.findFirst({
		where: {
			authUser: {
				email
			}
		},
		include: {
			authUser: true
		},
		orderBy: {
			created: 'desc'
		}
	});
	let hashExists = false;
	const argon2id = new Argon2id();

	if (latestAuthKeyRecord?.hashed_password && !hashExists) {
		const verifiedKey = await argon2id.verify(latestAuthKeyRecord.hashed_password, password);
		if (verifiedKey) {
			verifiedUser = latestAuthKeyRecord.authUser;
			hashExists = true;
		}
	}
	if (!hashExists) {
		throw new Error('Incorrect email or password.');
	}
	return verifiedUser;
};

export const loginEmailPassword = async (authUserId: string, unloggedId?: string) => {
	await auth.invalidateUserSessions(authUserId);
	const session = await auth.createSession(authUserId, {});

	const { user } = (await auth.validateSession(session.id)) ?? null;

	if (unloggedId) {
		await transferUserData(prisma, authUserId, unloggedId);
	}

	return { user, session };
};

export const createUserAndSendEmail = async (
	firstName: string,
	lastName: string,
	email: string,
	password: string,
	profilePicture: string,
	is_verified: boolean,
	is_admin: boolean,
	ipAddress: string
) => {
	// create user
	const argon2id = new Argon2id();
	const hash = await argon2id.hash(password);

	const authUserRecord = await prisma.authUser.create({
		data: {
			id: nanoid(),
			username: alphanumericGenerator(10),
			firstName,
			lastName,
			email,
			profilePicture,
			is_verified,
			is_admin,
			ipAddress
		}
	});

	await prisma.authKey.create({
		data: {
			id: nanoid(),
			authUser: {
				connect: {
					id: authUserRecord.id
				}
			},
			hashed_password: hash
		}
	});
	const luciaUser = getUserAttributes(authUserRecord);
	const user = {
		id: luciaUser.id,
		is_verified: false,
		username: luciaUser.username,
		firstName: luciaUser.firstName,
		lastName: luciaUser.lastName,
		email: luciaUser.email,
		profilePicture: luciaUser.profilePicture
	};

	// send email verification
	const token = await generateVerificationToken(user.id);
	await sendEmailVerificationEmail(user.email, token);
};

export const deleteUser = async (userAttributes: User) => {
	// delete user if user is not verified
	await auth.invalidateSession(userAttributes.id);
	// await auth.invalidateAllUserSessions(user.id);
	await prisma.authUser.delete({
		where: {
			id: userAttributes.id
		}
	});
};

export const invalidateSession = async (sessionToken: string) => {
	await auth.invalidateSession(sessionToken);
};

export const getAuthUserByEmail = async (email: string) => {
	return await prisma.authUser.findUnique({
		where: {
			email
		}
	});
};

export const generateAndSendVerificationEmail = async (authUser: PrismaModels['AuthUser']) => {
	const token = await generateVerificationToken(authUser.id);
	await sendEmailResetPassword(authUser.email, token.toString());
};

export const updateUserPassword = async (userAttributes: User, password: string) => {
	await auth.invalidateUserSessions(userAttributes.id);

	// update key
	const argon2id = new Argon2id();
	const hash = await argon2id.hash(password);
	await prisma.authKey.create({
		data: {
			id: nanoid(),
			authUser: {
				connect: {
					id: userAttributes.id
				}
			},
			hashed_password: hash
		}
	});

	const session = await auth.createSession(userAttributes.id, {});
	const { user } = await auth.validateSession(session.id);

	return { session, user };
};

export const verifyAuthUserEmail = async (code?: string, unloggedId?: string) => {
	let session = null;
	let user = null;
	if (code && unloggedId) {
		user = await validatAuthUserToken(code, true);
		if (user) {
			user = await prisma.authUser.update({
				where: {
					id: user.id
				},
				data: {
					is_verified: true
				}
			});
			if (unloggedId) {
				await transferUserData(prisma, user.id, unloggedId);
			}
			session = await auth.createSession(user.id, {});
		}
	} else {
		throw new Error('Invalid code or unloggedId');
	}

	return { user, session };
};

export const continueWithGoogle = async (
	storedState?: string,
	codeVerifierCookie?: string,
	state?: string,
	code?: string,
	unloggedId?: string,
	ipAddress = ''
) => {
	let userAttributes: User | null = null;
	let session = undefined;
	if (
		storedState === state &&
		googleAuth !== undefined &&
		code !== undefined &&
		codeVerifierCookie !== undefined
	) {
		const tokens = await googleAuth.validateAuthorizationCode(code, codeVerifierCookie);
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
		userAttributes = await getUser();
		session = await auth.createSession(userAttributes.id, {});

		if (unloggedId) {
			await transferUserData(prisma, userAttributes.id, unloggedId);
		}
	}
	return { user: userAttributes, session };
};
