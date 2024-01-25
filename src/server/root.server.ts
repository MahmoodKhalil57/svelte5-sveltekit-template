import type { APIType } from '$lib/apiUtils/server/ApiUtils.type.server';
import testRouter from '$api/routes/testRouter.server';
import authRouter from '$api/routes/authRouter.server';
import callback from '$api/routes/callback.server';

export const API = {
	testRouter,
	authRouter,
	callback
} satisfies APIType;
