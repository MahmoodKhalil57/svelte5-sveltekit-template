import { auth } from '$api/clients/luciaClient.server';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ cookies }) => {
	const sessionId = cookies.get(auth.sessionCookieName) ?? '';
	const { user } = await auth.validateSession(sessionId);

	return { user };
};
