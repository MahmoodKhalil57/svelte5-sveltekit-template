import type { ApiStructureStructure } from '$lib/utils/apiUtils/server/ApiUtils.type.server';
import { z } from 'zod';
import type { middlewareMap } from '$api/helpers/middleware.server';

export const apiStructure = {
	testRouter: {
		testPost: {
			requestType: 'POST',
			public: true,
			validation: z.object({ name: z.string().min(1) }) satisfies z.AnyZodObject,
			formStructure: [
				[{ id: 'name', type: 'TEXT', placeHolder: 'Name', label: 'Name' }],
				[
					{
						id: 'submitTestPost',
						type: 'SUBMIT'
					}
				]
			] as const
		},
		testGet: {
			requestType: 'GET',
			validation: z.object({}) satisfies z.AnyZodObject
		}
	}
} satisfies ApiStructureStructure<typeof middlewareMap>;
