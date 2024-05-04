<script lang="ts">
	import type { z } from 'zod';

	import { toastWrapper } from '$src/lib/utils/toastWrapper';

	import { publicApiStructure } from '$src/lib/utils/apiUtils/client/clientApiStructure';

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
	import ButtonDefault from '$lib/components/ui/buttonDefault.svelte';
	import FormElement from '$lib/components/form/formElement.svelte';
	import type { PublicRoutes, PublicProcedures } from '$apiUtils/server/ApiUtils.type.server';
	import type { SuccessFullApiSend } from '$lib/client/apiClient';

	import { makeApiRequest } from '$apiUtils/client/apiClientUtils';

	let flashData:
		| {
				message: string;
				color?: string;
		  }
		| undefined
		| null;
	export let inlineErrors: ErrorIssue[] = [];
	export let disabledButton = false;

	type R = $$Generic<PublicRoutes>;
	type P = $$Generic<PublicProcedures<R>>;
	export let route: R;
	export let procedure: P;

	export let formStructure = getFormStructureWithRouteProcedure(route, procedure) as Exclude<
		ReturnType<typeof getFormStructureWithRouteProcedure<R, P>>,
		never[]
	>;

	export let formData = getEmptyFormObject(formStructure);

	export let preValidation:
		| ((
				payload: ReturnType<
					typeof getEmptyFormObject<(typeof publicApiStructure)[R][P]['formStructure']>
				>
		  ) => ReturnType<typeof validateZod<z.AnyZodObject, APIInputType<R, P>>>)
		| undefined = undefined;

	export let extraValidation:
		| ((payload: APIInputType<R, P>) => ReturnType<typeof validateZod>)
		| undefined = undefined;

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
				// @ts-expect-error this is fine.
				const preValidationResponse = await preValidation(formData);
				validationSuccess = validationSuccess && preValidationResponse.validationSuccess;
				if (validationSuccess) {
					// @ts-expect-error this is fine.
					payload = preValidationResponse.safePayload;
				} else if (preValidationResponse.response) {
					validationSuccess = false;
					inlineErrors = preValidationResponse.response.errorIssues ?? [];
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
				const resStatus = await handleFlashMessageFunction(flashData, inlineErrors, response);
				flashData = resStatus.flashData;
				inlineErrors = resStatus.inlineErrors;
				validationSuccess = resStatus.requestSuccess;
			}
			if (!validationSuccess) {
				const errorMessage = flashData?.message ?? inlineErrors?.[0]?.errorMessages?.[0] ?? '';
				throw new Error(errorMessage);
			} else {
				const resetSubmitEvent = () => {
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

	export const submitFetchRequest = async (
		route: R,
		procedure: P,
		formData: APIInputType<R, P>
	) => {
		let validate: boolean | undefined;
		// @ts-ignore
		if (publicApiStructure[route]?.[procedure]?.validation) {
			validate = true;
		}
		return await makeApiRequest('POST', route, procedure, formData, validate, extraValidation);
	};

	export let handleFlashMessage = async (
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
			case responseStatus.INTERNAL_SERVER_ERROR:
				// @ts-expect-error 2339
				flashData = { message: response?.body?.data?.message ?? 'Internal Server Error' };
				break;
			case responseStatus.VALIDATION_ERROR:
				// @ts-expect-error 2339
				inlineErrors = response?.errorIssues ?? [];
				break;
			default:
				break;
		}
		return { flashData: flashData, inlineErrors: inlineErrors, requestSuccess };
	};

	export let onSuccess = async (data: {
		resetSubmitEvent: () => void;
		response: SuccessFullApiSend<R, P>;
	}) => {
		inlineErrors = [];
		data.resetSubmitEvent();
	};
</script>

<form
	id="{route}/{String(procedure)}"
	class="flex flex-col w-full max-w-xl gap-3 px-10 justify-center items-center"
	novalidate
	on:submit|preventDefault={(event) => onSubmit(event, handleFlashMessage)}
>
	<div>
		<FormFlashMessage {flashData} />
	</div>
	<div class="flex flex-col gap-3 w-full">
		{#each formStructure as row}
			<div class="flex flex-row gap-2">
				{#each row as field}
					<div class="flex flex-col w-full">
						<FormElement {field} bind:value={formData[field.id]} />
						<FormErrorMessage fieldName={field.id} {inlineErrors} />
					</div>
				{/each}
			</div>
		{/each}
	</div>
	<div class="flex flex-col items-center justify-center gap-10 w-3/4 max-w-[300px] mt-2 md:mt-5">
		<ButtonDefault
			value="Reset Password"
			Class="btn-secondary btn w-full self-center capitalize sm:text-[100%]"
			dynamicDisabled={disabledButton}
		>
			Submit
		</ButtonDefault>
	</div>
</form>
