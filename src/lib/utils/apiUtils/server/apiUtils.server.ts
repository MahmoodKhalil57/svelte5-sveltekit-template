import {
	fail,
	json,
	error,
	redirect,
	type Cookies,
	type Redirect,
	type HttpError,
	type NumericRange,
	type Handle
} from '@sveltejs/kit';
import type { z } from 'zod';
import { responseStatus } from '../client/serverResponse';
import type { ErrorIssue, ServerStoreHandle } from '../client/apiClientUtils';
import type {
	RequestType,
	Routes,
	Procedures,
	MiddlewareMap,
	GetContext,
	ApiStructureStructure,
	StructureRoutes,
	StructureProcedures,
	ApiType,
	EndpointType,
	serverStoreActionInputs,
	LogData
} from './ApiUtils.type.server';
import { zu } from 'zod_utilz';

let loggerData: { request?: Request; requestStatus?: responseStatus } = {};

type CookieSerializeOptions = Parameters<Cookies['set']>[2];
export const cookiesWrapper = (
	cookies: Cookies | Map<string, string> = new Map<string, string>()
) => {
	return {
		get: (name: string) => cookies.get(name),
		set: (name: string, value: string, opts: CookieSerializeOptions) =>
			cookies.set(name, value, opts)
	} as Cookies;
};

const getZodValidationWithRouteProcedure = <
	R extends StructureRoutes,
	P extends StructureProcedures<R>,
	AS extends ApiStructureStructure<MiddlewareMap<Awaited<ReturnType<GetContext>>>>
>(
	route: R,
	procedure: P,
	apiStructure: AS
) => {
	// @ ts-expect-error ts I dont know what this error is even
	const scheme = apiStructure[route][procedure];
	const formStructure = scheme['validation'] as (typeof scheme)['validation'];
	return formStructure;
};

const getLooseValidationWithRouteProcedure = <
	R extends StructureRoutes,
	P extends StructureProcedures<R>,
	AS extends ApiStructureStructure<MiddlewareMap<Awaited<ReturnType<GetContext>>>>
>(
	route: R,
	procedure: P,
	apiStructure: AS
) => {
	// @ ts-expect-error ts I dont know what this error is even
	const scheme = apiStructure[route][procedure];
	const strictField = scheme?.['loose'] as boolean | undefined;
	return !!strictField;
};

const getMiddleWaresWithRouteProcedure = <
	R extends Routes<AS>,
	P extends Procedures<AS, R>,
	AS extends ApiStructureStructure<MiddlewareMap<Awaited<ReturnType<GetContext>>>>,
	GC extends GetContext,
	MP extends MiddlewareMap<Awaited<ReturnType<GC>>>
>(
	route: R,
	procedure: P,
	apiStructure: AS,
	middlewareMap: MP
) => {
	// @ ts-expect-error ts I dont know what this error is even
	const scheme = apiStructure[route][procedure];
	const midlewareKeys = scheme?.['middlewares'] as (keyof typeof middlewareMap)[] | undefined;
	const middlewares = midlewareKeys?.map((key) => middlewareMap?.[key]);
	return middlewares;
};

const getEndpointTypeWithRouteProcedure = <
	R extends Routes<AS>,
	P extends Procedures<AS, R>,
	AS extends ApiStructureStructure<MiddlewareMap<Awaited<ReturnType<GetContext>>>>
>(
	route: R,
	procedure: P,
	apiStructure: AS
) => {
	// @ ts-expect-error ts I dont know what this error is even
	const scheme = apiStructure[route][procedure];
	const endpointType = scheme?.['endpointType'] ?? 'default';
	return endpointType;
};

const getParams = async (url: URL) => {
	let apiRouteType: ApiRouteType | undefined = undefined;
	let route: string = '';
	let procedure: string = '';
	const pathArray = url.pathname.substring(1).split('/');
	if (pathArray.length === 3) {
		apiRouteType = pathArray[0] as ApiRouteType;
		route = pathArray[1] ?? '';
		procedure = pathArray[2] ?? '';
	}
	return { apiRouteType, route, procedure };
};

const getData = async (
	url: URL,
	request: Request,
	rawBody: string,
	endpointType?: EndpointType
) => {
	let data: any = {};
	switch (request.method as RequestType) {
		case 'POST':
			if (request) {
				if (endpointType === endpoints.form) {
					data = await request.formData();
				} else {
					if (rawBody) {
						data = rawBody;
					} else {
						data = await request.text();
					}
				}
			}
			break;
		case 'GET':
			if (endpointType === endpoints.callback) {
				data = url.searchParams;
			} else {
				data = url.searchParams.get('input') ?? undefined;
			}
			break;
	}

	return { data };
};

export const throwError = (codeNum: NumericRange<400, 599>) => {
	error(codeNum, { message: responseStatus[codeNum] ?? 'FORBIDDEN' });
};

export const getError = <S extends responseStatus, B>(status: S, body: B) => {
	loggerData.requestStatus = status;
	return {
		status,
		body
	};
};

type ResponseType<Mapping extends { [key in keyof Mapping]: unknown }> = {
	[S in keyof Mapping]: {
		status: S;
		body: Mapping[S];
	};
}[keyof Mapping];

export const getResponse = <
	S extends responseStatus,
	R extends {
		[key in S]: {
			message?: string;
			data?: any;
			stores?: serverStoreActionInputs<ServerStoreHandle>;
			clientRedirect?: string;
		};
	}
>(
	status: S,
	serverReturns: R
) => {
	return {
		status,
		body: serverReturns[status]
	} as ResponseType<R>;
};

export const getCallbackInputsFromUrlParams = <I extends string[]>(url: URL, inputs: I) => {
	const inputObject = inputs.reduce(
		(acc, input) => {
			acc = { ...acc, [input]: url.searchParams.get(input) };
			return acc;
		},
		{} as Record<I[number], string>
	);
	return new URL(
		`${url.toString().split('?')[0] ?? ''}?input=${encodeURIComponent(JSON.stringify(inputObject))}`
	);
};

export const clearSpecificCookies = (cookies: Cookies, cookiesToDelete: string[]) => {
	cookiesToDelete.forEach((cookie) => {
		cookies.set(cookie, '', {
			path: '/',
			expires: new Date(0)
		});
	});
};

export const svelteApiHandle =
	<
		AS extends ApiStructureStructure<MiddlewareMap<Awaited<ReturnType<GetContext>>>>,
		GC extends GetContext,
		MP extends MiddlewareMap<Awaited<ReturnType<GC>>>,
		LD extends LogData | undefined,
		STHDL extends ServerStoreHandle | undefined
	>(
		apiStructure: AS,
		getContext: GC,
		middlewareMap: MP,
		API: ApiType<AS, GC, MP, STHDL>,
		cookieVersion = '0.0.0',
		logData?: LD
	): Handle =>
	async ({ event, resolve }) => {
		const { cookies } = handleCookieVersion(event.cookies, cookieVersion);
		event.cookies = cookies;
		logData?.clear();
		// init hybridUser
		try {
			// check cookies to see if has unloggedUserID
			const hasUnloggedUser = cookies.get('unloggedinSession');
			if (middlewareMap?.hybridUserProcedure && !hasUnloggedUser) {
				await middlewareMap?.hybridUserProcedure(
					// @ts-expect-error - this is fine
					await getContext(cookies, event.request, '', event.getClientAddress)
				);
			}
		} catch (e) {
			logData?.error({
				codeLocation: '🚀 ~ e:',
				message: JSON.stringify(e),
				request: loggerData.request,
				requestStatus: loggerData.requestStatus
			});
		}

		// handle api request
		const [first] = event.url.pathname.split('/').filter((x) => x);
		if (ApiRouteType.api === first) {
			let response = json({
				body: { message: 'Internal server error' },
				status: responseStatus.INTERNAL_SERVER_ERROR
			});
			try {
				const bodyResponse = await handleRequest(
					event.url,
					event.request,
					event.cookies,
					event.getClientAddress,
					apiStructure,
					getContext,
					middlewareMap,
					API,
					logData
				);
				logData?.info({
					codeLocation: '🚀 ~ bodyResponse:',
					response: bodyResponse as Response,
					request: loggerData.request,
					requestStatus: loggerData.requestStatus
				});
				await logData?.flush();
				const cookies = event.cookies.getAll();
				const headers = new Headers();
				cookies.forEach(({ name, value }) => {
					const serializedCookie = event.cookies.serialize(name, value, {
						path: '/' //hardcode path
					});
					headers.append('Set-Cookie', serializedCookie); // Use append to add multiple headers
				});

				response = json(bodyResponse, {
					headers: headers
				});
			} catch (e) {
				if ((e as Redirect)?.location) {
					redirect((e as Redirect)?.status, (e as Redirect)?.location);
				}
				loggerData.requestStatus = responseStatus.NOT_FOUND;
				logData?.error({
					codeLocation: '🚀 ~ e:',
					message: JSON.stringify(e),
					request: loggerData.request,
					requestStatus: loggerData.requestStatus
				});
				await logData?.flush();
				throw fail(404);
			}
			return response;
		}

		// resolve normally
		return await resolve(event);
	};

export const handleRequest = async <
	AS extends ApiStructureStructure<MiddlewareMap<Awaited<ReturnType<GetContext>>>>,
	GC extends GetContext,
	MP extends MiddlewareMap<Awaited<ReturnType<GC>>>,
	LD extends LogData | undefined,
	STHDL extends ServerStoreHandle | undefined
>(
	url: URL,
	request: Request,
	cookies: Cookies,
	getClientAddress: () => string,
	apiStructure: AS,
	getContext: GC,
	middlewareMap: MP,
	API: ApiType<AS, GC, MP, STHDL>,
	logData?: LD
) => {
	loggerData.request = request;

	if (!['GET', 'POST'].includes(request.method)) {
		// method not allowed
		return getError(responseStatus.NOT_FOUND, { message: 'Method Not Allowed' });
	}

	let zodValidation: z.AnyZodObject | undefined;
	let parsedData: z.infer<ReturnType<typeof getZodValidationWithRouteProcedure>> | undefined;
	let looseValidation: boolean | undefined;

	let rawBody = '';

	const params = await getParams(url);
	let contextWrapper: { ctx: Awaited<ReturnType<GC>> };
	let middlewares: ReturnType<typeof getMiddleWaresWithRouteProcedure<string, string, AS, GC, MP>>;
	let endpointType:
		| ReturnType<typeof getEndpointTypeWithRouteProcedure<string, string, AS>>
		| undefined = undefined;

	try {
		if (params.route && params.procedure) {
			endpointType = getEndpointTypeWithRouteProcedure(
				params.route,
				params.procedure,
				apiStructure
			);

			// @ ts-expect-error ts doesnt like it but this works
			const requestType = apiStructure[params.route][params.procedure].requestType;
			if (requestType === (request.method as RequestType)) {
				zodValidation = getZodValidationWithRouteProcedure(
					params.route,
					params.procedure,
					apiStructure
				);
				looseValidation = getLooseValidationWithRouteProcedure(
					params.route,
					params.procedure,
					apiStructure
				);
			}
		}
	} catch (e) {
		logData?.error({
			codeLocation: '🚀 ~ e:',
			message: JSON.stringify(e),
			request: loggerData.request,
			requestStatus: loggerData.requestStatus
		});
	}

	if (
		!(
			request.headers.get('content-type') === 'application/x-www-form-urlencoded' ||
			request?.headers?.get('content-type')?.startsWith('multipart/form-data')
		) &&
		endpointType === endpoints.form
	) {
		return getError(responseStatus.BAD_REQUEST, { message: 'Content Type Not Allowed' });
	}

	if (endpointType !== endpoints.form) {
		rawBody = await request.text();
	}

	try {
		contextWrapper = {
			ctx: (await getContext(cookies, request, rawBody, getClientAddress)) as Awaited<
				ReturnType<GC>
			>
		};
		middlewares = getMiddleWaresWithRouteProcedure<string, string, AS, GC, MP>(
			params.route,
			params.procedure,
			apiStructure,
			middlewareMap
		);
		while (middlewares && middlewares?.length > 0) {
			const middleware = middlewares.shift();
			if (middleware) {
				const nextCtx = await middleware(contextWrapper.ctx);
				contextWrapper = { ...contextWrapper, ...nextCtx };
			}
		}
	} catch (error) {
		if ((error as Redirect)?.location) {
			// callback redirects
			redirect((error as Redirect)?.status, (error as Redirect)?.location);
		}
		if (error as HttpError) {
			// middleware error
			return error;
		}
		// some procedure error
		return getError(responseStatus.INTERNAL_SERVER_ERROR, { message: 'Internal server error' });
	}

	const { data } = await getData(url, request, rawBody, endpointType);

	logData?.info({
		codeLocation: '🚀 ~ data:',
		message: JSON.stringify(data),
		request: loggerData.request,
		requestStatus: loggerData.requestStatus
	});

	if (looseValidation) {
		if (request.method === 'POST') {
			if (endpointType === endpoints.form && zodValidation?.shape[0]) {
				let newData = {};
				const dataShape = zodValidation.shape[0];
				Object.entries(dataShape).forEach(([key, value]) => {
					const extractedValue = data.get(key);
					if (extractedValue) {
						newData = { ...newData, [key]: extractedValue };
					}
				});
				parsedData = newData;
			} else if (endpointType !== endpoints.form) {
				parsedData = JSON.parse(data);
			}
		} else if (request.method === 'GET' && zodValidation?.shape[0]) {
			// extract the shapedata from request url search params
			let newData = {};
			const datashape = zodValidation.shape[0];
			Object.entries(datashape).forEach(([key, value]) => {
				const extractedValue = url.searchParams.get(key);
				if (extractedValue) {
					newData = { ...newData, [key]: extractedValue };
				}
			});
			parsedData = newData;
		}
	} else if (zodValidation) {
		let safeparseRes:
			| z.SafeParseReturnType<
					{
						[x: string]: any;
					},
					{
						[x: string]: any;
					}
			  >
			| undefined;

		if (request.method === 'POST') {
			if (endpointType === endpoints.form) {
				safeparseRes = await zu.useFormData(zodValidation).safeParseAsync(data);
			} else if (endpointType === endpoints.default) {
				let jsonData: any;
				try {
					jsonData = zu.stringToJSON().safeParse(data);
				} catch (e) {
					logData?.error({
						codeLocation: '🚀 ~ e:',
						message: JSON.stringify(e),
						request: loggerData.request,
						requestStatus: loggerData.requestStatus
					});
				}
				safeparseRes = zodValidation.safeParse(jsonData?.data);
			}
		} else if (request.method === 'GET') {
			if (endpointType === endpoints.callback) {
				safeparseRes = await zu.useURLSearchParams(zodValidation).safeParseAsync(data);
			} else if (endpointType === endpoints.default) {
				let jsonData: any;
				try {
					jsonData = zu.stringToJSON().safeParse(data);
				} catch (e) {
					logData?.error({
						codeLocation: '🚀 ~ e:',
						message: JSON.stringify(e),
						request: loggerData.request,
						requestStatus: loggerData.requestStatus
					});
				}
				safeparseRes = zodValidation.safeParse(jsonData?.data);
			}
		}

		if (safeparseRes?.success !== true && safeparseRes?.error) {
			const errorIssues: ErrorIssue[] = [];
			const errors = safeparseRes.error.formErrors.fieldErrors;
			Object.entries(errors).forEach((error) => {
				const firstErrorKey = error[0];
				let errorMessages = error[1];
				errorMessages = [...new Set(errorMessages)];
				errorIssues.push({
					key: firstErrorKey,
					errorMessages
				});
			});
			// validation error
			return getError(responseStatus.BAD_REQUEST, {
				message: errorIssues?.[0]?.errorMessages?.[0] ?? 'Validation Error'
			});
		} else if (safeparseRes?.success === true) {
			parsedData = safeparseRes.data;
		}
	} else {
		// procedure not found
		return getError(responseStatus.NOT_FOUND, { message: 'Procedure Not Found' });
	}

	if (parsedData) {
		// TODO: Shouldnt be able to access procedure unless is GET
		// @ ts-expect-error - this is fine
		const givenProcedure = API[params.route][params.procedure];

		try {
			if (givenProcedure !== undefined) {
				// @ts-expect-error - this is fine
				const givenProcedureRes = await givenProcedure({ ...contextWrapper, input: parsedData });
				// @ts-expect-error - this is fine
				loggerData.requestStatus = contextWrapper.ctx.status as responseStatus;
				return givenProcedureRes;
			}
			return getError(responseStatus.NOT_FOUND, { message: 'Procedure Not Found' });
		} catch (error) {
			if ((error as Redirect)?.location) {
				loggerData.requestStatus = responseStatus.UNAUTHORIZED;
				// callback redirects
				redirect((error as Redirect)?.status, (error as Redirect)?.location);
			}
			if (error as HttpError) {
				// middleware error
				return error;
			}
			// some procedure error
			return getError(responseStatus.INTERNAL_SERVER_ERROR, { message: 'Internal server error' });
		}
	}
	return getError(responseStatus.INTERNAL_SERVER_ERROR, { message: 'Internal server error' });
};

export enum ApiRouteType {
	api = 'api'
}

export const endpoints = {
	form: 'form',
	default: 'default',
	callback: 'callback'
};

const handleCookieVersion = (cookies: Cookies, cookiesVersion: string) => {
	const cookiesVersionSynced = cookies.get('cookiesVersion')
		? cookies.get('cookiesVersion') === cookiesVersion
		: false;

	if (!cookiesVersionSynced) {
		cookies.set('cookiesVersion', cookiesVersion, {
			path: '/'
		});
		const cookiesToClear = ['auth_session', 'google_oauth_state', 'unloggedinSession'];
		clearSpecificCookies(cookies, cookiesToClear);
	}

	return { cookies };
};
