<script lang="ts">
	import { responseStatus } from '$lib/apiUtils/client/serverResponse';

	import { promiseToastV2 } from '$lib/apiUtils/client/formUtils';

	import FormErrorMessage from '$lib/components/form/formErrorMessage.svelte';
	import FormFlashMessage from '$lib/components/form/formFlashMessage.svelte';
	import {
		getFormStructureWithRouteProcedure,
		getEmptyFormObject,
		type ErrorIssue,
		type ApiClientError
	} from '$lib/apiUtils/client/apiClientUtils';
	import ButtonDefault from '$lib/components/ui/buttonDefault.svelte';
	import FormElement from './formElement.svelte';
	import type {
		Routes,
		Procedures,
		APIInput,
		APIOutput
	} from '$lib/apiUtils/server/ApiUtils.type.server';

	import { makeApiRequest } from '$lib/apiUtils/client/apiClientUtils';

	let flashData:
		| {
				message: string;
				color?: string;
		  }
		| undefined
		| null;
	export let inlineErrors: ErrorIssue[] = [];
	export let disabledButton = false;

	type R = $$Generic<Routes>;
	type P = $$Generic<Procedures<R>>;
	export let route: R;
	export let procedure: P;

	export let formStructure = getFormStructureWithRouteProcedure(route, procedure) as Exclude<
		ReturnType<typeof getFormStructureWithRouteProcedure>,
		undefined
	>;

	export let formData = getEmptyFormObject(formStructure);

	const onSubmit = async (
		submitEvent: SubmitEvent,
		handleFlashMessageFunction: typeof handleFlashMessage
	) => {
		const submitForm = async (submitEvent: SubmitEvent) => {
			disabledButton = true;
			const response = await submitFetchRequest(route, procedure, formData as APIInput<R, P>);
			const resStatus = await handleFlashMessageFunction(flashData, inlineErrors, response);
			flashData = resStatus.flashData;
			inlineErrors = resStatus.inlineErrors;
			if (!resStatus.requestSuccess) {
				const errorMessage = flashData?.message ?? inlineErrors?.[0]?.errorMessages?.[0] ?? '';
				throw new Error(errorMessage);
			} else {
				const resetSubmitEvent = () => {
					// @ts-expect-error 2339
					submitEvent?.target?.reset();
				};
				await onSuccess({ resetSubmitEvent });
			}
			return response;
		};
		await promiseToastV2(submitForm(submitEvent)).finally(() =>
			setTimeout(() => {
				disabledButton = false;
			}, 1000)
		);
	};

	export const submitFetchRequest = async (route: R, procedure: P, formData: APIInput<R, P>) => {
		return await makeApiRequest(
			// @ts-expect-erroritForm requesttype of makeApiRequest is expected to be POST
			'POST',
			route,
			procedure,
			formData,
			true
		);
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
		response: APIOutput<R, P> | ApiClientError
	) => {
		let requestSuccess = false;
		// @ts-expect-error 2339
		switch (response?.status) {
			case responseStatus.SUCCESS:
				requestSuccess = true;
				break;
			case responseStatus.INTERNAL_SERVER_ERROR:
				// @ts-expect-error 2339
				flashData = { message: response?.body?.message ?? 'Internal Server Error' };
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

	export let onSuccess = async (data: { resetSubmitEvent: () => void }) => {
		data.resetSubmitEvent();
	};
</script>

<form
	id="{route}/{String(procedure)}"
	class="flex flex-col items-center justify-center w-full max-w-xl gap-3 px-10"
	novalidate
	on:submit|preventDefault={(event) => onSubmit(event, handleFlashMessage)}
>
	<div>
		<FormFlashMessage {flashData} />
	</div>
	<div class="flex flex-col w-full gap-3">
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
	<div class="flex flex-col items-center justify-center gap-10 w-3/4 max-w-[300px]">
		<ButtonDefault
			value="Reset Password"
			innerClass="btn-secondary btn w-full self-center capitalize sm:text-[100%]"
			dynamicDisabled={disabledButton}
		>
			Submit
		</ButtonDefault>
	</div>
</form>
