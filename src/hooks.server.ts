import type { Handle } from '@sveltejs/kit';
// import { auth } from '$api/clients/luciaClient.server';
import { sequence } from '@sveltejs/kit/hooks';
import { handleCookieVersion, handleApiRequests } from '$lib/apiUtils/server/apiUtils.server';

const apiHook: Handle = async ({ event, resolve }) => {
	// handle cookie version
	handleCookieVersion(event.cookies);

	// handle api request
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	const [route, procedeur, ..._] = event.url.pathname.split('/').filter((x) => x);
	if (route && procedeur && ['api', 'callback'].includes(route)) {
		return handleApiRequests(event, route, procedeur);
	}

	// resolve normally
	return await resolve(event);
};
export const handle = sequence(apiHook);

// const luciaHandle: Handle = async ({ event, resolve }) => {
// 	event.locals.auth = auth.handleRequest(event);
// 	return await resolve(event);
// };

// export const handle = sequence(luciaHandle, apiHook);
