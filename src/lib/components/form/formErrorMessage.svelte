<script lang="ts">
	import { spring } from 'svelte/motion';
	import { afterUpdate } from 'svelte';
	import type { ApiClientError } from '$src/lib/utils/apiUtils/client/apiClientUtils';

	const getInlineErrors = (key: string, errorIssues: ApiClientError['errorIssues']) => {
		let errorMessages: string[] | undefined;
		const selectedError = errorIssues.find((val) => val.key === key);
		if (selectedError) {
			errorMessages = selectedError.errorMessages;
		}
		return errorMessages;
	};

	const size = spring();
	export let fieldName: Parameters<typeof getInlineErrors>[0];
	export let inlineErrors: Parameters<typeof getInlineErrors>[1];

	export let Class = '';
	export let errorMessageClass = '';

	let divElement: HTMLDivElement | undefined;

	$: errors = getInlineErrors(fieldName, inlineErrors);

	afterUpdate(() => {
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
