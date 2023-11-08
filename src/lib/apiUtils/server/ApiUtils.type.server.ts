import type { ComponentProps } from 'svelte';
import type FormBuilder from '$lib/components/form/formBuilder.svelte';
import type { apiStructure, InputTypeEnum } from '$lib/apiUtils/apiStructure';
import type { API } from '$api/root.server';
import type { z } from 'zod';
import type { getContext } from '$api/preRequest/context.server';
import type { responseStatus } from '$lib/apiUtils/server/apiUtils.server';

export type Field = { id: string; label: string; type: InputTypeEnum; placeHolder?: string };
export type FormStructure = readonly (readonly Field[])[];

export type ApiStructure = typeof apiStructure;
export type Routes = keyof ApiStructure;
export type Procedures<R extends Routes> = keyof ApiStructure[R];

export type FormProps<R extends Routes, P extends Procedures<R>> = ComponentProps<
	FormBuilder<R, P>
>;
export type RequestType = 'POST' | 'GET';

export type ServerResponse = Promise<{
	body: {
		message?: string;
		data?: any;
	};
	status: responseStatus;
}>;

export type APIType = {
	[R in Routes]: {
		[P in Procedures<Routes>]: ApiStructure[R][P] extends { [key: string]: unknown }
			? (args: {
					ctx: ReturnType<typeof getContext>;
					input: z.infer<ApiStructure[R][P]['validation']>;
			  }) => ServerResponse
			: never;
	};
};

export type APITypeB<R extends Routes> = {
	[P in Procedures<R>]: ApiStructure[R][P] extends { [key: string]: unknown }
		? (args: {
				ctx: ReturnType<typeof getContext>;
				// @ts-expect-error ts doesnt like it but this works
				input: z.infer<ApiStructure[R][P]['validation']>;
		  }) => ServerResponse
		: never;
};

export type APITypeC<R extends Routes, P extends Procedures<R>> = (args: {
	ctx: ReturnType<typeof getContext>;
	// @ts-expect-error ts doesnt like it but this works
	input: z.infer<ApiStructure[R][P]['validation']>;
}) => ServerResponse;

export type APIInput<R extends Routes, P extends Procedures<R>> =
	// @ts-expect-error ts doesnt like it but this works
	z.infer<ApiStructure[R][P]['validation']>;

export type APIRequestType<R extends Routes, P extends Procedures<R>> =
	// @ts-expect-error ts doesnt like it but this works
	ApiStructure[R][P]['requestType'];

export type APIOutput<R extends Routes, P extends Procedures<R>> = Awaited<
	// @ts-expect-error ts doesnt like it but this works
	ReturnType<(typeof API)[R][P]>
>;

export type PageConfig = {
	route: Routes;
	procedure: Procedures<Routes>;
};

// A type utility that tests if a type is a non-object (i.e., is a "leaf")
export type IsLeaf<T> = T extends object ? (keyof T extends never ? true : false) : true;
