// +page.server.ts
import { auth } from '$api/clients/luciaClient.server';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ cookies }) => {
	let userAttributes = null;
	const authSessionId = cookies.get(auth.sessionCookieName);

	if (authSessionId) {
		userAttributes = (await auth.validateSession(authSessionId))?.user;
	}
	return { userAttributes };
};
