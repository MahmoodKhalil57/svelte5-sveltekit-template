import type { Cookies } from '@sveltejs/kit';
import type { z, AnyZodObject } from 'zod';
import type { responseStatus } from '../client/serverResponse';
import type { InputTypeEnum, ApiClientError, ServerStoreHandle } from '../client/apiClientUtils';
import type { endpoints } from './apiUtils.server';
import type { apiStructure } from '$api/helpers/apiStructure.server';
import type { getContext } from '$api/helpers/context.server';
import type { middlewareMap } from '$api/helpers/middleware.server';

export type EndpointType = keyof typeof endpoints;
export type Field = {
	id: string;
	label?: string;
	type: keyof typeof InputTypeEnum;
	placeHolder?: string;
	href?: string;
	text?: string;
	Class?: string;
	ContainerClass?: string;
};
export type FormStructure = readonly (readonly Field[])[];

export type PublicApiStructureType = {
	[key: string]: {
		[key: string]: {
			validation?: AnyZodObject;
			formStructure?: FormStructure;
			memoize?: boolean;
			endpointType?: EndpointType;
		};
	};
};

export type PublicRoutes<AS extends PublicApiStructureType> = keyof AS extends never
	? ''
	: keyof AS;
export type PublicProcedures<
	AS extends PublicApiStructureType,
	R extends PublicRoutes<AS>
> = keyof AS[R];

export type ApiStructureStructure<MP> = {
	[key: string]: {
		[key: string]: ValidationType<MP>;
	};
};

export type ValidationType<MP> =
	| {
			requestType: RequestType;
			endpointType?: Exclude<EndpointType, 'form'>;
			memoize?: boolean;
			formStructure?: FormStructure;
			loose?: boolean;
			validation: AnyZodObject;
			public?: boolean;
			files?: FileType;
			middlewares?: (keyof MP)[];
	  }
	| {
			requestType: 'POST';
			endpointType: 'form';
			memoize?: boolean;
			formStructure?: FormStructure;
			loose?: boolean;
			validation: AnyZodObject;
			public?: boolean;
			files?: FileType;
			middlewares?: (keyof MP)[];
	  };

export type Routes<
	AS extends ApiStructureStructure<MiddlewareMap<Awaited<ReturnType<GetContext>>>>
> = keyof AS;
export type Procedures<
	AS extends ApiStructureStructure<MiddlewareMap<Awaited<ReturnType<GetContext>>>>,
	R extends Routes<AS>
> = keyof AS[R];

export type StructureRoutes = keyof ApiStructureStructure<
	MiddlewareMap<Awaited<ReturnType<GetContext>>>
>;
export type StructureProcedures<R extends StructureRoutes> = keyof ApiStructureStructure<
	MiddlewareMap<Awaited<ReturnType<GetContext>>>
>[R];

export type RequestType = 'POST' | 'GET';
export type FileType = {
	name: string;
	authority: 'private';
}[];

export type serverStoreActionInputs<STHDL extends ServerStoreHandle | undefined> = {
	[K in keyof STHDL]?: {
		[K2 in keyof STHDL[K]]?: STHDL[K][K2] extends (value: infer V) => void ? V : never;
	};
};

export type ServerResponse<STHDL extends ServerStoreHandle | undefined> = Promise<{
	body: {
		message?: string;
		data?: any;
		stores?: serverStoreActionInputs<STHDL>;
		clientRedirect?: string;
	};
	status: responseStatus;
}>;

export type ApiType<
	AS extends ApiStructureStructure<MiddlewareMap<Awaited<ReturnType<GetContext>>>>,
	GC extends GetContext,
	MP extends MiddlewareMap<Awaited<ReturnType<GC>>>,
	STHDL extends ServerStoreHandle | undefined
> = {
	[R in Routes<AS>]: {
		[P in Procedures<AS, R>]: AS[R][P] extends { [key: string]: unknown }
			? (
					// @ts-expect-error this is fine
					args: ContextOutput<AS, R, P, GC, MP> & {
						input: z.infer<AS[R][P]['validation']>;
					}
				) => ServerResponse<STHDL>
			: never;
	};
};

type UnionToIntersection<U> = (U extends any ? (k: U) => void : never) extends (k: infer I) => void
	? I
	: never;

export type MiddlwareAllPossibleReturns<
	GC extends GetContext,
	MP extends MiddlewareMap<Awaited<ReturnType<GC>>>,
	MWN extends (keyof MP)[]
> = UnionToIntersection<Awaited<ReturnType<MP[MWN[number]]>>>;

type MiddlewareOutput<
	AS extends ApiStructureStructure<MP>,
	// @ts-expect-error this is fine
	R extends Routes<AS>,
	// @ts-expect-error this is fine
	P extends Procedures<AS, R>,
	GC extends GetContext,
	MP extends MiddlewareMap<Awaited<ReturnType<GC>>>
> = AS[R][P]['middlewares'] extends (keyof MP)[]
	? MiddlwareAllPossibleReturns<GC, MP, AS[R][P]['middlewares']>
	: undefined;

export type ContextOutput<
	AS extends ApiStructureStructure<MP>,
	// @ts-expect-error this is fine
	R extends Routes<AS>,
	// @ts-expect-error this is fine
	P extends Procedures<AS, R>,
	GC extends GetContext,
	MP extends MiddlewareMap<Awaited<ReturnType<GC>>>
> =
	MiddlewareOutput<AS, R, P, GC, MP> extends undefined
		? { ctx: Awaited<ReturnType<GC>> }
		: MiddlewareOutput<AS, R, P, GC, MP>;

export type APIInput<
	AS extends ApiStructureStructure<MiddlewareMap<Awaited<ReturnType<GetContext>>>>,
	R extends Routes<AS>,
	P extends Procedures<AS, R>
> = z.infer<AS[R][P]['validation']>;

export type EndpointTypeInferred<
	AS extends ApiStructureStructure<MiddlewareMap<Awaited<ReturnType<GetContext>>>>,
	R extends Routes<AS>,
	P extends Procedures<AS, R>
> = AS[R][P]['endpointType'];

export type APIRequestType<
	AS extends ApiStructureStructure<MiddlewareMap<Awaited<ReturnType<GetContext>>>>,
	R extends Routes<AS>,
	P extends Procedures<AS, R>
> = AS[R][P]['requestType'];

export type APIOutput<
	R,
	P,
	API
	// @ts-expect-error this is fine
> = Awaited<ReturnType<API[R][P]>> | ApiClientError;

// A type utility that tests if a type is a non-object (i.e., is a "leaf")
export type IsLeaf<T> = T extends object ? (keyof T extends never ? true : false) : true;

export type SuccessfullType<T> = T extends { status: responseStatus.SUCCESS } ? T : never;

export type HasValidate<
	AS extends ApiStructureStructure<MiddlewareMap<Awaited<ReturnType<GetContext>>>>,
	R extends Routes<AS>,
	P extends Procedures<AS, R>
> = AS[R][P]['validation'] extends AnyZodObject ? boolean | undefined : undefined;

export type GetContext = (
	cookies: Cookies,
	request: Request,
	rawBody: string,
	getClientAddress: () => string
) => Promise<unknown>;

export type MiddlewareMap<CTX extends Awaited<ReturnType<GetContext>>> = {
	[key: string]: (ctx: CTX) => Promise<{ ctx: CTX }>;
};

export type LogData = {
	clear: () => void;
	info: (data: {
		codeLocation: string;
		message?: string;
		request?: Request | undefined;
		response?: Response | undefined;
		requestStatus?: responseStatus | undefined;
		identifier?: string;
	}) => void;
	error: (data: {
		codeLocation: string;
		message: string;
		request?: Request | undefined;
		response?: Response | undefined;
		requestStatus?: responseStatus | undefined;
		identifier?: string;
	}) => void;
	flush: () => Promise<void>;
};
