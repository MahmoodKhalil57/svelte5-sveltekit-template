<script lang="ts">
	import { spring } from 'svelte/motion';
	import type { ApiClientError } from '$lib/utils/apiUtils/client/apiClientUtils';

	const getInlineErrors = (key: string, errorIssues: ApiClientError['errorIssues']) => {
		let errorMessages: string[] | undefined;
		const selectedError = errorIssues.find((val) => val.key === key);
		if (selectedError) {
			errorMessages = selectedError.errorMessages;
		}
		return errorMessages;
	};

	const size = spring();

	let {
		class: Class = '',
		fieldName,
		inlineErrors,
		errorMessageClass = '',
	}: {
		class?: string;
		fieldName:  Parameters<typeof getInlineErrors>[0];
		inlineErrors:  Parameters<typeof getInlineErrors>[1];
		errorMessageClass?: string;
	} = $props();


	let divElement: HTMLDivElement | undefined;


	let errors = $derived(getInlineErrors(fieldName, inlineErrors));

	$effect(() => {
		$size = errors?.length ? divElement?.firstElementChild?.clientHeight : 0;
	});

</script>

<div bind:this={divElement} class="overflow-hidden" style="height:{$size}px">
	<div class="flex flex-col items-start pt-[13px] pl-[18px] overflow-x-scroll {Class}">
		{#each errors ?? [] as errorMessage}
			<li class="w-max list-disc text-error {errorMessageClass}">
				{errorMessage}
			</li>
		{/each}
	</div>
</div>
