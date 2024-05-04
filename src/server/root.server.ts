import type { ApiType } from '$apiUtils/server/ApiUtils.type.server';
import type { apiStructure } from '$api/helpers/apiStructure.server';
import type { getContext } from '$api/helpers/context.server';
import type { middlewareMap } from '$api/helpers/middleware.server';
import testRouter from '$api/routes/testRouter.server';
import authRouter from '$api/routes/authRouter.server';
import type { serverStoreHandle } from '$src/lib/stores/serverStoreHandle';

export const API = {
	testRouter,
	authRouter
} satisfies APIType;

export type APIType = ApiType<
	typeof apiStructure,
	typeof getContext,
	typeof middlewareMap,
	typeof serverStoreHandle
>;

export { responseStatus } from '$apiUtils/client/serverResponse';

export { getResponse } from '$apiUtils/server/apiUtils.server';
