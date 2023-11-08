import { z } from 'zod';

export enum InputTypeEnum {
	TEXT,
	EMAIL,
	TEXTAREA
}

export const apiStructure = {
	testRouter: {
		testPost: {
			requestType: 'POST',
			validation: z.object({ name: z.string() }) satisfies z.AnyZodObject
		},
		testGet: {
			requestType: 'GET',
			validation: z.object({ name: z.string() }) satisfies z.AnyZodObject
		}
	}
} as const;
