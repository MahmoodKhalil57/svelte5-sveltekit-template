<script lang="ts">
	import { serverStoreHandle } from '$lib/stores/serverStoreHandle';

	import type { z } from 'zod';

	import { toastWrapper } from '$lib/utils/toastWrapper';

	import { publicApiStructure } from '$lib/utils/apiUtils/client/clientApiStructure';

	import type { APIInputType, APIOutputType } from '$lib/client/apiClient';
	import { responseStatus } from '$lib/client/apiClient';

	import FormErrorMessage from '$lib/components/form/formErrorMessage.svelte';
	import FormFlashMessage from '$lib/components/form/formFlashMessage.svelte';
	import {
		getFormStructureWithRouteProcedure,
		getEmptyFormObject,
		type ErrorIssue,
		type ApiClientError,
		validateZod
	} from '$apiUtils/client/apiClientUtils';
	import FormElement from '$lib/components/form/formElement.svelte';
	import type { PublicRoutes, PublicProcedures } from '$apiUtils/server/ApiUtils.type.server';
	import type { SuccessFullApiSend } from '$lib/client/apiClient';

	import { makeApiRequest } from '$apiUtils/client/apiClientUtils';
	import { beforeNavigate } from '$app/navigation';

	let unsavedWork: boolean | null = null;

	let flashData:
		| {
				message: string;
				color?: string;
		  }
		| undefined
		| null = $state(undefined)

		let {
		route,
		procedure,
		class: Class = '',
		inlineErrors = [],
		disabledButton = false,
		areYouSure = false,
		formStructure = $bindable(undefined),
		formData = $bindable({}),
		preValidation = undefined,
		// @ts-ignore
		submitFetchRequest = async (
		route: R,
		procedure: P,
		formData: APIInputType<R, P>
	) => {
		let validate: boolean | undefined;
		if (publicApiStructure[route]?.[procedure]?.validation) {
			validate = true;
		}
		return await makeApiRequest(
			'POST',
			route,
			procedure,
			formData,
			validate,
			extraValidation,
			fetch,
			serverStoreHandle
		);
	},
		extraValidation = undefined,
		handleFlashMessage = async (
		flashData:
			| {
					message: string;
					color?: string;
			  }
			| undefined
			| null,
		inlineErrors: ErrorIssue[],
		response: APIOutputType<R, P> | ApiClientError
	) => {
		let requestSuccess = false;
		// @ts-expect-error 2339
		switch (response?.status) {
			case responseStatus.SUCCESS:
				requestSuccess = true;
				// @ts-expect-error 2339
				if (response?.body?.data?.message) {
					// @ts-expect-error 2339
					flashData = { message: response.body.data.message, color: 'text-green-400' };
				}
				break;
			case responseStatus.VALIDATION_ERROR:
				flashData = undefined;
				// @ts-expect-error 2339
				inlineErrors = response?.errorIssues ?? [];
				break;
			default:
				// @ts-expect-error 2339
				if (response?.body?.data?.message) {
					// @ts-expect-error 2339
					flashData = { message: response?.body?.data?.message ?? 'Internal Server Error' };
				}
				break;
		}
		return { flashData: flashData, inlineErrors: inlineErrors, requestSuccess };
	},
		onSuccess = async (data: {
		resetSubmitEvent: () => void;
		response: SuccessFullApiSend<R, P>;
	}) => {
		data.resetSubmitEvent();
	}
	}: {
		route: R;
		procedure: P;
		class?: string;
		inlineErrors?:  ErrorIssue[];
		disabledButton?:  boolean;
		areYouSure?: boolean;
		formStructure?: ReturnType<typeof getFormStructureWithRouteProcedure>;
		formData?: ReturnType<typeof getEmptyFormObject>;
		preValidation?: ((
				payload: ReturnType<
					typeof getEmptyFormObject<(typeof publicApiStructure)[R][P]['formStructure']>
				>
		  ) => Promise<
				Partial<Awaited<ReturnType<typeof validateZod<z.AnyZodObject, APIInputType<R, P>>>>>
		  >),
		submitFetchRequest?: (
				route: R,
				procedure: P,
				formData: APIInputType<R, P>
			) => Promise<APIOutputType<R, P> | ApiClientError>;
		extraValidation?: (payload: APIInputType<R, P>) => ReturnType<typeof validateZod>;
		handleFlashMessage?: (
			flashData:
				| {
						message: string;
						color?: string;
				  }
				| undefined
				| null,
			inlineErrors: ErrorIssue[],
			response: APIOutputType<R, P> | ApiClientError
		) => Promise<{
			flashData: {
				message: string;
				color?: string;
			} | undefined | null;
			inlineErrors: ErrorIssue[];
			requestSuccess: boolean;
		}>;
		onSuccess?: (data: {
			resetSubmitEvent: () => void;
			response: SuccessFullApiSend<R, P>;
		}) => Promise<void>;
	} = $props();


	type R = $$Generic<PublicRoutes>;
	type P = $$Generic<PublicProcedures<R>>;

	formStructure = getFormStructureWithRouteProcedure(route, procedure) as Exclude<
		ReturnType<typeof getFormStructureWithRouteProcedure<R, P>>,
		never[]
	>;

	formData = getEmptyFormObject(formStructure);

	const onSubmit = async (
		submitEvent: SubmitEvent,
		handleFlashMessageFunction: typeof handleFlashMessage
	) => {
		const submitForm = async (submitEvent: SubmitEvent) => {
			let response: APIOutputType<R, P> | ApiClientError | undefined;
			disabledButton = true;
			let payload = formData;
			let validationSuccess = true;
			if (preValidation && formData) {
				const preValidationResponse = await preValidation(formData);
				// @ts-expect-error this is fine.
				validationSuccess = validationSuccess && preValidationResponse.validationSuccess;
				if (validationSuccess) {
					payload = preValidationResponse.safePayload!;
				} else if (preValidationResponse.response) {
					validationSuccess = false;
					inlineErrors = preValidationResponse.response.errorIssues ?? [];
					flashData = undefined;
				}
			}
			if (validationSuccess) {
				response = await submitFetchRequest(
					route,
					procedure,
					payload as ReturnType<
						typeof getEmptyFormObject<(typeof publicApiStructure)[R][P]['formStructure']>
					>
				);
				const resStatus = await handleFlashMessageFunction(flashData, inlineErrors, response!);
				flashData = resStatus.flashData;
				inlineErrors = resStatus.inlineErrors;
				validationSuccess = resStatus.requestSuccess;
			}
			if (!validationSuccess) {
				const errorMessage = flashData?.message ?? inlineErrors?.[0]?.errorMessages?.[0] ?? '';
				flashData = null;
				throw new Error(errorMessage);
			} else {
				const resetSubmitEvent = () => {
					inlineErrors = [];
					formData = getEmptyFormObject(formStructure);
					// @ts-expect-error 2339
					submitEvent?.target?.reset();
				};
				await onSuccess({
					resetSubmitEvent,
					response: response as SuccessFullApiSend<R, P>
				});
			}
			return response;
		};
		toastWrapper()
			.promise(submitForm(submitEvent), {
				loading: 'Submitting...',
				success: (res) => {
					// @ts-ignore
					return res?.body?.data?.message ?? 'Success';
				},
				error: 'Internal error.'
			})
			.finally(() =>
				setTimeout(() => {
					disabledButton = false;
				}, 1000)
			);
	};

	beforeNavigate(({ cancel }) => {
		if (unsavedWork && areYouSure) {
			if (
				!confirm(
					'Are you sure you want to leave this page? You have unsaved changes that will be lost.'
				)
			) {
				cancel();
			}
		}
	});

	const formChange = () => {
		if (unsavedWork === false) {
			unsavedWork = true;
		}
	};
</script>

<form
	id="{route}/{String(procedure)}"
	class="flex flex-col w-full max-w-xl gap-3 px-10 justify-start items-center {Class}"
	novalidate
	oninput={formChange}
	onsubmit={(event) => onSubmit(event, handleFlashMessage)}
>
	<div>
		<FormFlashMessage {flashData} />
	</div>
	<div class="flex flex-col gap-3 w-full">
		{#each formStructure as row}
			<div class="flex flex-row gap-2">
				{#each row as field}
					<div class="flex flex-col w-full justify-center items-center">
						<FormElement {field} bind:value={formData[field.id]} {disabledButton} />
						<FormErrorMessage fieldName={field.id} {inlineErrors} />
					</div>
				{/each}
			</div>
		{/each}
	</div>
</form>
