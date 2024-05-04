import type { ApiType } from '$apiUtils/server/ApiUtils.type.server';
import type { apiStructure } from '$api/helpers/apiStructure.server';
import type { getContext } from '$api/helpers/context.server';
import type { middlewareMap } from '$api/helpers/middleware.server';
import testRouter from '$api/routes/testRouter.server';
import authRouter from '$api/routes/authRouter.server';
import callback from '$api/routes/callback.server';

export const API = {
	testRouter,
	authRouter,
	callback
} satisfies APIType;

export type APIType = ApiType<typeof apiStructure, typeof getContext, typeof middlewareMap>;

export { responseStatus } from '$apiUtils/client/serverResponse';

export { getResponse } from '$apiUtils/server/apiUtils.server';
