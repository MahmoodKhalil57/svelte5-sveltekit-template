<script lang="ts">
	import ButtonDefault from '$lib/components/ui/buttonDefault.svelte';

	let {
		class: Class = '',
		id = undefined,
		label = '',
		placeHolder = '',
		value = $bindable(''),
		showCopy = false,
	}: {
		class?: string;
		id?: string;
		label?: string;
		placeHolder?: string;
		value?: string;
		showCopy?: boolean;
	} = $props();

	const copyText = () => {
		navigator.clipboard.writeText(value);
	};
</script>

<div class="w-full relative">
	{#if showCopy}
		<ButtonDefault
			onclick={copyText}
			id="test"
			class="absolute i-material-symbols-content-copy right-0 text-base-content opacity-10 hover:bg-base-content hover:opacity-80 m-3"
		/>
	{/if}
	<label class="w-full">
		{#if label}
			<span>{label}:</span>
		{/if}

		<textarea
			class="!outline-none textarea textarea-bordered w-full !p-5 {Class}"
			placeholder={placeHolder}
			{id}
			name={id}
			bind:value
		></textarea>
	</label>
</div>
