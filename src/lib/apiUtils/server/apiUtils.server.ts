/* eslint-disable @typescript-eslint/no-explicit-any */
import type {
	RequestType,
	Routes,
	Procedures,
	APIInput,
	APIOutput
} from '$lib/apiUtils/server/ApiUtils.type.server';
import {
	fail,
	json,
	type Cookies,
	type Redirect,
	redirect,
	type HttpError,
	type RequestEvent
} from '@sveltejs/kit';
import type { z } from 'zod';
import { API } from '$api/root.server';
import { getContext } from '$api/preRequest/context.server';
import { apiStructure } from '$lib/apiUtils/apiStructure';
import { error } from '@sveltejs/kit';
import { responseStatus } from '$lib/apiUtils/client/serverResponse';
import type { ErrorIssue } from '../client/apiClientUtils';
export { responseStatus };

type CookieSerializeOptions = Parameters<Cookies['set']>[2];
export const cookiesWrapper = (
	cookies: Cookies | Map<string, string> = new Map<string, string>()
) => {
	return {
		get: (name: string) => cookies.get(name),
		set: (name: string, value: string, opts?: CookieSerializeOptions | undefined) =>
			cookies.set(name, value, opts)
	} as Cookies;
};

const getZodValidationWithRouteProcedure = <R extends Routes, P extends Procedures<R>>(
	route: R,
	procedure: P
) => {
	const scheme = apiStructure[route][procedure];
	// @ts-expect-error ts I dont know what this error is even
	const formStructure = scheme['validation'] as (typeof scheme)['validation'];
	return formStructure;
};

const getParams = async (url: URL, request: Request) => {
	let route: string = '';
	let procedure: string = '';
	let data: any = {};
	const pathArray = url.pathname.substring(1).split('/');
	if (pathArray.length === 3) {
		route = pathArray[1] ?? '';
		procedure = pathArray[2] ?? '';
	} else if (pathArray.length === 2) {
		route = pathArray[0] ?? '';
		procedure = pathArray[1] ?? '';
	}

	switch (request.method as RequestType) {
		case 'POST':
			if (request) {
				data = await request.json();
			}
			break;
		case 'GET':
			data = JSON.parse(decodeURIComponent(url.searchParams.get('input') ?? '{}'));
			break;
	}

	return { route, procedure, data };
};

export const handleRequest = async (url: URL, request: Request, cookies: Cookies) => {
	if (!['GET', 'POST'].includes(request.method)) {
		// method not allowed
		return getError(responseStatus.NOT_FOUND, { message: 'Method Not Allowed' });
	}

	let zodValidation: z.AnyZodObject | undefined;
	let parsedData: z.infer<ReturnType<typeof getZodValidationWithRouteProcedure>> | undefined;

	const params = await getParams(url, request);
	if (params.route && params.procedure) {
		// @ts-expect-error ts doesnt like it but this works
		const requestType = apiStructure[params.route][params.procedure].requestType;
		if (requestType === (request.method as RequestType)) {
			// @ts-expect-error ts doesnt like it but this works
			zodValidation = getZodValidationWithRouteProcedure(params.route, params.procedure);
		}
	}

	if (zodValidation) {
		const safeparseRes = await zodValidation.safeParseAsync(params.data);

		if (safeparseRes?.success !== true) {
			const errorIssues: ErrorIssue[] = [];
			const errors = safeparseRes.error.formErrors.fieldErrors;
			Object.entries(errors).forEach((error) => {
				const [firstErrorKey, errorMessages] = error;
				errorIssues.push({
					key: firstErrorKey,
					errorMessages: [...new Set(errorMessages)]
				});
			});
			// validation error
			return getError(responseStatus.BAD_REQUEST, {
				message: errorIssues?.[0]?.errorMessages?.[0] ?? 'Validation Error'
			});
		} else {
			parsedData = safeparseRes.data as typeof parsedData;
		}
	} else {
		// procedure not found
		return getError(responseStatus.NOT_FOUND, { message: 'Procedure Not Found' });
	}

	if (parsedData) {
		const context = getContext(cookies, request);
		// TODO: Shouldnt be able to access procedure unless is GET
		// @ts-expect-error ts doesnt like it but this works
		const givenProcedure = API[params.route][params.procedure];

		try {
			return await givenProcedure({ ctx: context, input: parsedData });
		} catch (error) {
			if ((error as Redirect)?.location) {
				// callback redirects
				throw redirect((error as Redirect)?.status, (error as Redirect)?.location);
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

export const svelteApiAdapter = async (event: { url: URL; request: Request; cookies: Cookies }) => {
	let response = json({
		body: { message: 'Internal server error' },
		status: responseStatus.INTERNAL_SERVER_ERROR
	}) as Response;
	try {
		const bodyResponse = await handleRequest(event.url, event.request, event.cookies);
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
	} catch (error) {
		if ((error as Redirect)?.location) {
			throw redirect((error as Redirect)?.status, (error as Redirect)?.location);
		}
		throw fail(404);
	}
	return response;
};

export const mockRequest = async <
	R extends Routes,
	P extends Procedures<R>,
	PL extends APIInput<R, P>
>(
	route: R,
	procedure: P,
	payload: PL,
	requestType: RequestType,
	initCookies: { name: string; value: string }[] = []
) => {
	let url = new URL(`http://localhost:3000/api/${route as string}/${procedure as string}`);
	let request: Request | undefined;
	if (requestType === 'POST') {
		request = new Request(url, {
			method: requestType,
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify(payload)
		});
	} else if (requestType === 'GET') {
		url = new URL(`${url}?input=${encodeURIComponent(JSON.stringify(payload))}`);
		request = new Request(url, {
			method: requestType,
			headers: {
				'Content-Type': 'application/json'
			}
		});
	}
	const cookies = cookiesWrapper();

	initCookies.forEach((cookie) => {
		cookies.set(cookie.name, cookie.value);
	});

	if (request) {
		try {
			const res = await handleRequest(url, request, cookies);
			return {
				response: res as APIOutput<R, P>,
				cookies
			};
		} catch (e) {
			return { error: e, cookies };
		}
	}
	return { response: null, cookies };
};

export const throwError = (codeNum: number) => {
	throw error(codeNum, { message: responseStatus[codeNum] ?? 'FORBIDDEN' });
};

export const getError = <S extends responseStatus, B>(status: S, body: B) => ({
	status,
	body
});

type ResponseType<Mapping extends { [key in keyof Mapping]: any }> = {
	[S in keyof Mapping]: {
		status: S;
		body: Mapping[S];
	};
}[keyof Mapping];

export const getResponse = <S extends responseStatus, R extends { [key in S]: any }>(
	status: S,
	serverReturns: R
): ResponseType<R> => {
	return {
		status,
		body: serverReturns[status]
	};
};

export const getCallbackInputsFromUrlParams = <I extends string[]>(url: URL, inputs: I) => {
	const inputObject = inputs.reduce((acc, input) => {
		acc = { ...acc, [input]: url.searchParams.get(input) };
		return acc;
	}, {} as Record<I[number], string>);
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

export const handleCookieVersion = (cookies: Cookies) => {
	const cookiesVersion = '0.0.5';
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
};

export const handleApiRequests = async (event: RequestEvent, route: string, procedeur: string) => {
	if (route === 'callback' && ['google', 'email'].includes(procedeur)) {
		// @ts-expect-error - this is fine
		const zodValidation = apiStructure[route][procedeur]['validation'] as z.ZodObject<any>;
		event.url = getCallbackInputsFromUrlParams(event.url, Object.keys(zodValidation.shape));
	}
	return await svelteApiAdapter(event);
};
