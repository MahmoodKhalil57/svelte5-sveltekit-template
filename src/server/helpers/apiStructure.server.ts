import type { ApiStructureStructure } from '$src/lib/utils/apiUtils/server/ApiUtils.type.server';
import { z } from 'zod';
import type { middlewareMap } from '$api/helpers/middleware.server';

export const apiStructure = {
	testRouter: {
		testPost: {
			requestType: 'POST',
			middlewares: ['devProcedure'],
			validation: z.object({ name: z.string() }) satisfies z.AnyZodObject
		},
		testGet: {
			requestType: 'GET',
			middlewares: ['devProcedure'],
			validation: z.object({ name: z.string() }) satisfies z.AnyZodObject
		}
	}
} satisfies ApiStructureStructure<typeof middlewareMap>;
