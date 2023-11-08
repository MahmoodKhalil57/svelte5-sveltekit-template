/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/ban-ts-comment */
import type {
	Routes,
	Procedures,
	APIInput,
	APIOutput,
	IsLeaf,
	RequestType,
	ApiStructure,
	APIRequestType,
	FormStructure
} from '$lib/apiUtils/server/ApiUtils.type.server';
import { apiStructure } from '$lib/apiUtils/apiStructure';
import { responseStatus } from '$lib/apiUtils/client/serverResponse';
import type { z } from 'zod';

export const getFormStructureWithRouteProcedure = <R extends Routes, P extends Procedures<R>>(
	route: R,
	procedure: P
) => {
	const scheme = apiStructure[route][procedure];
	// @ts-expect-error ts I dont know what this error is even
	const formStructure = scheme['formStructure'] as (typeof scheme)['formStructure'];
	return formStructure as FormStructure;
};

export const getEmptyFormObject = <DynamicFormStructure extends FormStructure>(
	formStructure: DynamicFormStructure
) => {
	type FormObject = {
		[key in (typeof formStructure)[number][number]['id']]: string;
	};
	return formStructure.flat().reduce((acc, field) => {
		acc[field.id as keyof FormObject] = '';
		return acc;
	}, {} as FormObject) as FormObject;
};

export const getZodValidationWithRouteProcedure = <R extends Routes, P extends Procedures<R>>(
	route: R,
	procedure: P
) => {
	const scheme = apiStructure[route][procedure];
	// @ts-expect-error ts I dont know what this error is even
	const formStructure = scheme['validation'] as (typeof scheme)['validation'];
	return formStructure;
};

export type ErrorIssue = { key: string; errorMessages: string[] | undefined };
export type ApiClientError = {
	errorMessage: string;
	errorIssues: ErrorIssue[];
	status: responseStatus.VALIDATION_ERROR;
};

export const validateZod = async <Z extends z.AnyZodObject, P>(zodValidation: Z, payload: P) => {
	let response: ApiClientError = {
		errorMessage: 'Something went wrong',
		status: responseStatus.VALIDATION_ERROR as const,
		errorIssues: []
	};
	const validationErrors = await zodValidation.safeParseAsync(payload);
	let validationSuccess = true;
	if (!validationErrors.success) {
		const errorIssues: ErrorIssue[] = [];
		const errors = validationErrors.error.formErrors.fieldErrors;
		Object.entries(errors).forEach((error) => {
			const [firstErrorKey, errorMessages] = error;
			errorIssues.push({
				key: firstErrorKey,
				errorMessages: [...new Set(errorMessages)]
			});
		});
		response = {
			errorMessage: 'Validation Error',
			status: responseStatus.VALIDATION_ERROR,
			errorIssues
		};
		validationSuccess = false;
	}
	return { validationSuccess, response };
};

export const makeApiRequest = async <
	RT extends APIRequestType<R, P>,
	R extends Routes,
	P extends Procedures<R>,
	T extends APIInput<R, P> | undefined,
	V extends boolean,
	E extends (payload: T) => ReturnType<typeof validateZod>
>(
	requestType: RT,
	route: R,
	procedure: P,
	payload: T,
	validate: V,
	extraValidation?: E,
	f = fetch
) => {
	let response: APIOutput<R, P> | ApiClientError = {
		errorMessage: 'Something went wrong',
		status: responseStatus.VALIDATION_ERROR as const,
		errorIssues: []
	};
	let validationSuccess = false;
	if (validate) {
		const zodValidation = getZodValidationWithRouteProcedure(route, procedure) as z.AnyZodObject;

		if (zodValidation) {
			const validateZodResponse = await validateZod(zodValidation, payload);
			validationSuccess = validateZodResponse.validationSuccess;
			response = validateZodResponse.response;

			if (extraValidation) {
				const extraValidationResponse = await extraValidation(payload);
				validationSuccess = validationSuccess && extraValidationResponse.validationSuccess;
				response = {
					errorMessage: extraValidationResponse.response.errorMessage || response.errorMessage,
					errorIssues: [...response.errorIssues, ...extraValidationResponse.response.errorIssues],
					status: responseStatus.VALIDATION_ERROR
				};
			}
		}
	}

	if (!validate || validationSuccess) {
		const path = `/api/${String(route)}/${String(procedure)}`;
		let rawResponse: Response;
		if (requestType === 'POST') {
			rawResponse = await f(path, {
				method: 'POST',
				body: JSON.stringify(payload)
			});
			response = (await rawResponse.json()) as APIOutput<R, P>;
		} else if (requestType === 'GET') {
			rawResponse = await f(`${path}?input=${encodeURIComponent(JSON.stringify(payload))}`, {
				method: 'GET'
			});
			response = (await rawResponse.json()) as APIOutput<R, P>;
		}
	}

	return response as V extends false ? APIOutput<R, P> : APIOutput<R, P> | ApiClientError;
};

// The recursive type
export type ProxyDataType<T, P> = {
	[K in keyof T]: IsLeaf<T[K]> extends true
		? // @ts-ignore - Fix this to be type of structure not type of input
		  APIRequestType<P, K> extends 'POST'
			? {
					POST: <
						V extends boolean,
						E extends (
							// @ts-ignore - Fix this to be type of structure not type of input
							formData: z.infer<ApiStructure[P][K]['validation']>
						) => ReturnType<typeof validateZod>
					>(
						// @ts-ignore - this is a hack to make the type work
						input: Parameters<T[K]>[0]['input'],
						validate: V,
						extraValidation?: E
					) => Promise<
						V extends false
							? // @ts-ignore - this is a hack to make the type work
							  Awaited<ReturnType<T[K]>>
							: // @ts-ignore - this is a hack to make the type work
							  Awaited<ReturnType<T[K]>> | ApiClientError
					>;
			  }
			: // @ts-ignore - Fix this to be type of structure not type of input
			APIRequestType<P, K> extends 'GET'
			? {
					GET: <
						V extends boolean,
						E extends (
							// @ts-ignore - Fix this to be type of structure not type of input
							formData: z.infer<ApiStructure[P][K]['validation']>
						) => ReturnType<typeof validateZod>
					>(
						// @ts-ignore - this is a hack to make the type work
						input: Parameters<T[K]>[0]['input'],
						validate: V,
						extraValidation?: E
					) => Promise<
						V extends false
							? // @ts-ignore - this is a hack to make the type work
							  Awaited<ReturnType<T[K]>>
							: // @ts-ignore - this is a hack to make the type work
							  Awaited<ReturnType<T[K]>> | ApiClientError
					>;
			  }
			: never
		: ProxyDataType<T[K], K>;
};

export const handlerBuilder = <F extends typeof fetch, T>(f?: F, path: string[] = []) => {
	return {
		get(target: T, prop: keyof T | RequestType): any {
			let requestType: RequestType | undefined = undefined;
			if (prop === 'POST') {
				requestType = 'POST';
			}
			if (prop === 'GET') {
				requestType = 'GET';
			}

			if (requestType) {
				return async (
					input: any,
					validate: boolean,
					extraValidation?: (payload: T) => ReturnType<typeof validateZod>
				) => {
					let current: any = apiStructure;
					for (const key of path) {
						current = current[key];
					}
					return await makeApiRequest(
						requestType!,
						path[0] as any,
						path[1] as any,
						input,
						validate,
						extraValidation,
						f
					);
				};
			}
			return new Proxy({} as T, handlerBuilder<F, any>(f, [...path, prop as string]));
		}
	};
};
