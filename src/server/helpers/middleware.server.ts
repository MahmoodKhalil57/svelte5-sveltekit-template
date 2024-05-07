import { responseStatus } from '$api/root.server';
import { throwError } from '$apiUtils/server/apiUtils.server';
import type { MiddlewareMap } from '$apiUtils/server/ApiUtils.type.server';
import type { getContext } from '$api/helpers/context.server';
import { dev } from '$app/environment';
import { logData } from '$api/helpers/logger.server';

export const middlewareMap = {
	devProcedure: async function (ctx) {
		if (!dev) {
			throwError(responseStatus.FORBIDDEN);
		}

		logData.info({
			codeLocation: '🚀 ~ hybridUser:',
			identifier: 'developer'
		});
		return { ctx };
	}
} satisfies MiddlewareMap<Awaited<ReturnType<typeof getContext>>>;
