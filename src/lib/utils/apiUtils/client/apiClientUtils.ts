import type { z } from 'zod';
import memoize from 'fast-memoize';
import type {
	Routes,
	Procedures,
	PublicRoutes,
	PublicProcedures,
	APIOutput,
	APIInput,
	IsLeaf,
	RequestType,
	APIRequestType,
	FormStructure,
	HasValidate,
	ApiStructureStructure,
	GetContext,
	MiddlewareMap,
	ApiType,
	EndpointTypeInferred
} from '../server/ApiUtils.type.server';
import { publicApiStructure } from '../client/clientApiStructure';
import { responseStatus } from '../client/serverResponse';
import zu from 'zod_utilz';
import { goto } from '$app/navigation';

export const InputTypeEnum = {
	// inputs
	TEXT: 'TEXT',
	EMAIL: 'EMAIL',
	TEXTAREA: 'TEXTAREA',
	PASSWORD: 'PASSWORD',
	// labels
	LINK: 'LINK',
	TITLE: 'TITLE',
	//buttons
	SUBMIT: 'SUBMIT',
	GOOGLESIGNIN: 'GOOGLESIGNIN',
	//deccorations
	DIVIDER: 'DIVIDER'
};

const makeGetRequest = async <PT extends string, PL>(pt: PT, pl: PL, f: typeof fetch) => {
	const rawResponse = await f(`${pt}?input=${encodeURIComponent(JSON.stringify(pl))}`, {
		method: 'GET'
	});
	const response = await rawResponse.json();
	return response;
};

const memoizedGet = memoize(makeGetRequest, {
	cache: {
		create() {
			const store: {
				[key: string]: {
					status: responseStatus;
				};
			} = {};
			return {
				has(key: string) {
					return key in store;
				},
				get(key: string) {
					return store[key] as any as Promise<{ status: responseStatus }>;
				},
				set(key: string, value: Promise<{ status: responseStatus }>) {
					const requestBlackList = ['{"name":"favorites","value":"true"}'];
					if (!requestBlackList.find((blackList) => key.replace(/ /g, '').includes(blackList))) {
						value.then((val) => {
							if (val.status === responseStatus.SUCCESS) {
								store[key] = val;
							}
						});
					}
				}
			};
		}
	}
});

export const getFormStructureWithRouteProcedure = <
	R extends PublicRoutes<typeof publicApiStructure>,
	P extends PublicProcedures<typeof publicApiStructure, R>
>(
	route: R,
	procedure: P
) => {
	// @ts-ignore fs
	const scheme = publicApiStructure?.[route]?.[procedure];
	// @ts-ignore fs
	const formStructure = scheme['formStructure'];
	return formStructure ?? [];
};

export const getEmptyFormObject = <DynamicFormStructure extends FormStructure>(
	formStructure: DynamicFormStructure
) => {
	type FormObject = {
		[key in DynamicFormStructure[number][number]['id']]?: string;
	};
	return formStructure.flat().reduce((acc, field) => {
		acc[field.id as keyof FormObject] = '';
		return acc;
	}, {} as FormObject) as FormObject;
};

export const getZodValidationWithRouteProcedure = <
	R extends PublicRoutes<typeof publicApiStructure>,
	P extends PublicProcedures<typeof publicApiStructure, R>
>(
	route: R,
	procedure: P
) => {
	// @ts-ignore fs
	const scheme = publicApiStructure?.[route]?.[procedure];
	// @ts-ignore vl
	const formStructure = scheme['validation'] as (typeof scheme)['validation'];
	return formStructure;
};

export const getEndpointTypeWithRouteProcedure = <
	R extends PublicRoutes<typeof publicApiStructure>,
	P extends PublicProcedures<typeof publicApiStructure, R>
>(
	route: R,
	procedure: P
) => {
	// @ts-ignore fs
	const scheme = publicApiStructure?.[route]?.[procedure];
	// @ts-ignore vl
	const endpointType = scheme?.['endpointType'] as (typeof scheme)['endpointType'];
	return endpointType;
};

export type ErrorIssue = { key: string; errorMessages: string[] | undefined };
export type ApiClientError = {
	errorMessage: string;
	errorIssues: ErrorIssue[];
	status: responseStatus.VALIDATION_ERROR;
};

export const validateZod = async <Z extends z.AnyZodObject, P>(zodValidation: Z, payload: P) => {
	let response: ApiClientError | undefined = {
		errorMessage: 'Something went wrong',
		status: responseStatus.VALIDATION_ERROR as const,
		errorIssues: []
	};
	const validationErrors = await zodValidation.safeParseAsync(payload);
	let validationSuccess = true;
	let safePayload: P | undefined = undefined;
	if (!validationErrors.success) {
		const errorIssues: ErrorIssue[] = [];
		const errors = validationErrors.error.formErrors.fieldErrors;
		Object.entries(errors).forEach((error) => {
			const firstErrorKey = error[0];
			let errorMessages = error[1];
			errorMessages = [...new Set(errorMessages)];
			errorIssues.push({
				key: firstErrorKey,
				errorMessages
			});
		});
		response = {
			errorMessage: 'Validation Error',
			status: responseStatus.VALIDATION_ERROR,
			errorIssues
		};
		validationSuccess = false;
	} else {
		// @ts-ignore - this is fine
		safePayload = validationErrors.data;
	}
	return {
		validationSuccess,
		response: response as ApiClientError | undefined,
		safePayload
	};
};

export const makeApiRequest = async <
	AS extends ApiStructureStructure<MiddlewareMap<Awaited<ReturnType<GetContext>>>>,
	RT extends APIRequestType<AS, R, P>,
	R extends Routes<AS>,
	P extends Procedures<AS, R>,
	T extends APIInput<AS, R, P> | EndpointTypeInferred<AS, R, P> extends 'form'
		? FormData
		: APIInput<AS, R, P>,
	V extends HasValidate<AS, R, P>,
	E extends (payload: T) => ReturnType<typeof validateZod>,
	STHDL extends ServerStoreHandle
>(
	requestType: RT,
	route: R,
	procedure: P,
	payload: T,
	validate: V,
	extraValidation?: E,
	f?: typeof fetch,
	serverStoreHandle?: STHDL
) => {
	let safePayload: T | undefined = undefined;
	let response:
		| APIOutput<
				R,
				P,
				ApiType<AS, GetContext, MiddlewareMap<Awaited<ReturnType<GetContext>>>, STHDL>
		  >
		| ApiClientError = {
		errorMessage: 'Something went wrong',
		status: responseStatus.VALIDATION_ERROR as const,
		errorIssues: []
	};
	let validationSuccess = false;
	// @ts-expect-error this is fine.
	const endpointType = getEndpointTypeWithRouteProcedure(route, procedure);
	if (validate) {
		// @ts-expect-error this is fine.
		let zodValidation = getZodValidationWithRouteProcedure(route, procedure) as z.AnyZodObject;

		if (zodValidation) {
			if (endpointType === 'form' && payload instanceof FormData) {
				// @ts-expect-error this is fine.
				zodValidation = zu.useFormData(zodValidation) as z.AnyZodObject;
			}
			const validateZodResponse = await validateZod(zodValidation, payload);
			validationSuccess = validateZodResponse.validationSuccess;
			const viladiationResponse = validateZodResponse?.response;
			if (viladiationResponse) {
				response = viladiationResponse;
			}
			safePayload = validateZodResponse?.safePayload;

			if (extraValidation && safePayload) {
				const extraValidationResponse = await extraValidation(safePayload);
				validationSuccess = validationSuccess && extraValidationResponse.validationSuccess;
				if (validationSuccess) {
					// @ts-expect-error this is fine.
					safePayload = extraValidationResponse.safePayload;
				} else if (extraValidationResponse.response) {
					response = {
						errorMessage: extraValidationResponse.response.errorMessage || response.errorMessage,
						errorIssues: [...response.errorIssues, ...extraValidationResponse.response.errorIssues],
						status: responseStatus.VALIDATION_ERROR
					};
				}
			}

			if (validationSuccess && endpointType === 'form' && payload instanceof Object) {
				const formData = new FormData();
				if (payload) {
					Object.entries(payload).forEach(([key, value]) => {
						if (value !== undefined) {
							if (value instanceof File) {
								formData.append(key, value);
							} else {
								formData.append(key, JSON.stringify(value));
							}
						}
					});
				}
				// @ts-expect-error this is fine.
				safePayload = formData;
			}
		}
	} else {
		if (endpointType === 'form' && payload instanceof Object) {
			const formData = new FormData();
			if (payload) {
				Object.entries(payload).forEach(([key, value]) => {
					if (value !== undefined) {
						if (value instanceof File) {
							formData.append(key, value);
						} else {
							formData.append(key, JSON.stringify(value));
						}
					}
				});
			}
			// @ts-expect-error this is fine.
			safePayload = formData;
		} else {
			safePayload = payload;
		}
	}

	if (!validate || validationSuccess) {
		const path = `/api/${String(route)}/${String(procedure)}`;
		if (requestType === 'POST') {
			let postPayload: string | FormData | undefined;
			if (endpointType === 'form') {
				// @ts-expect-error this is fine.
				postPayload = safePayload;
			} else {
				postPayload = safePayload ? JSON.stringify(safePayload) : undefined;
			}
			response = (await (
				await (f ?? fetch)(path, {
					method: 'POST',
					body: postPayload
				})
			).json()) as APIOutput<
				R,
				P,
				ApiType<AS, GetContext, MiddlewareMap<Awaited<ReturnType<GetContext>>>, STHDL>
			>;
		} else if (requestType === 'GET') {
			// @ts-ignore rt
			if (publicApiStructure?.[route]?.[procedure]?.memoize) {
				response = (await memoizedGet(path, safePayload, f ?? fetch)) as APIOutput<
					R,
					P,
					ApiType<AS, GetContext, MiddlewareMap<Awaited<ReturnType<GetContext>>>, STHDL>
				>;
			} else {
				response = (await makeGetRequest(path, safePayload, f ?? fetch)) as APIOutput<
					R,
					P,
					ApiType<AS, GetContext, MiddlewareMap<Awaited<ReturnType<GetContext>>>, STHDL>
				>;
			}
		}
	}

	if (serverStoreHandle && response.status === responseStatus.SUCCESS) {
		if (response?.body?.stores) {
			// @ts-ignore - this is fine
			handleStoreResponse(serverStoreHandle, response.body.stores);
		}

		if (response?.body?.clientRedirect) {
			if (response.body.clientRedirect.startsWith('https')) {
				window.location.href = response.body.clientRedirect;
			} else {
				goto(response.body.clientRedirect);
			}
		} else if (response?.body?.clientRedirect === '') {
			window.location.reload();
		}
	}

	return response as V extends false
		? APIOutput<
				R,
				P,
				ApiType<AS, GetContext, MiddlewareMap<Awaited<ReturnType<GetContext>>>, STHDL>
			>
		:
				| APIOutput<
						R,
						P,
						ApiType<AS, GetContext, MiddlewareMap<Awaited<ReturnType<GetContext>>>, STHDL>
				  >
				| ApiClientError;
};

export type ServerStoreHandle = {
	[key: string]: {
		[key: string]: (value: any) => Promise<void> | void;
	};
};

const handleStoreResponse = (
	serverStoreHandle: ServerStoreHandle,
	stores: { [key: string]: { [key: string]: {} } }
) => {
	Object.entries(stores).forEach(([storeName, store]) => {
		Object.entries(store).forEach(([storeAction, value]) => {
			serverStoreHandle[storeName][storeAction](value);
		});
	});
};

// The recursive type
export type ProxyDataType<
	AS extends ApiStructureStructure<MiddlewareMap<Awaited<ReturnType<GetContext>>>>,
	T,
	P
> = {
	[K in keyof T]: IsLeaf<T[K]> extends true
		? // @ts-ignore - this is a hack to make the type work
			APIRequestType<AS, P, K> extends 'POST'
			? {
					POST: <
						I,
						// @ts-ignore - this is a hack to make the type work
						V extends HasValidate<AS, P, K>,
						E extends (
							// @ts-ignore - Fix this to be type of structure not type of input
							formData: z.infer<AS[P][K]['validation']>
						) => ReturnType<typeof validateZod>
					>(
						// @ts-ignore - this is a hack to make the type work
						input: EndpointTypeInferred<AS, P, K> extends 'form'
							? // @ts-ignore - this is a hack to make the type work
								FormData | Parameters<T[K]>[0]['input']
							: // @ts-ignore - this is a hack to make the type work
								Parameters<T[K]>[0]['input'],
						validate?: V,
						extraValidation?: E
					) => Promise<
						V extends false | undefined
							? // @ts-ignore - this is a hack to make the type work
								Awaited<ReturnType<T[K]>>
							: // @ts-ignore - this is a hack to make the type work
								Awaited<ReturnType<T[K]>> | ApiClientError
					>;
				}
			: // @ts-ignore - Fix this to be type of structure not type of input
				APIRequestType<AS, P, K> extends 'GET'
				? {
						GET: <
							I,
							// @ts-ignore - this is a hack to make the type work
							V extends HasValidate<AS, P, K>,
							E extends (
								// @ts-ignore - Fix this to be type of structure not type of input
								formData: z.infer<AS[P][K]['validation']>
							) => ReturnType<typeof validateZod>
						>(
							// @ts-ignore - this is a hack to make the type work
							input: Parameters<T[K]>[0]['input'],
							validate?: V,
							extraValidation?: E
						) => Promise<
							V extends false | undefined
								? // @ts-ignore - this is a hack to make the type work
									Awaited<ReturnType<T[K]>>
								: // @ts-ignore - this is a hack to make the type work
									Awaited<ReturnType<T[K]>> | ApiClientError
						>;
					}
				: never
		: ProxyDataType<AS, T[K], K>;
};

export const handlerBuilder = <F extends typeof fetch, STHDL extends ServerStoreHandle, T>(
	f?: F,
	serverStoreHandle?: STHDL,
	path: string[] = []
) => ({
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
				validate: boolean = false,
				extraValidation?: (payload: T) => ReturnType<typeof validateZod>
			) =>
				await makeApiRequest(
					requestType!,
					path[0] as any,
					path[1] as any,
					input,
					validate,
					extraValidation,
					f,
					serverStoreHandle
				);
		}
		return new Proxy(
			{} as T,
			handlerBuilder<F, STHDL, any>(f, serverStoreHandle, [...path, prop as string])
		);
	}
});

export const apiSendBuilder = <
	AS extends ApiStructureStructure<MiddlewareMap<Awaited<ReturnType<GetContext>>>>,
	API,
	STHDL extends ServerStoreHandle | undefined
>(
	f?: typeof fetch,
	serverStoreHandle?: STHDL
) => new Proxy({}, handlerBuilder(f, serverStoreHandle)) as ProxyDataType<AS, API, undefined>;
