import type { GetContext } from '$apiUtils/server/ApiUtils.type.server';
import { responseStatus } from '$api/root.server';

export const getContext = (async (cookies, request, rawBody, getClientAddress) => {
	const status = responseStatus.INTERNAL_SERVER_ERROR as responseStatus;

	return {
		cookies,
		request,
		rawBody,
		getClientAddress,
		status
	};
}) satisfies GetContext;
