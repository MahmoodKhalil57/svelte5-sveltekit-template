<script lang="ts">
	import ButtonDefault from '$lib/components/ui/buttonDefault.svelte';

	export let label: string = '';
	export let placeHolder: string = '';
	export let id: string | undefined = undefined;
	export let value: string = '';
	export let Class: string = '';

	export let showCopy = false;

	const copyText = () => {
		navigator.clipboard.writeText(value);
	};
</script>

<div class="w-full relative">
	{#if showCopy}
		<ButtonDefault
			onClick={copyText}
			id="test"
			Class="absolute i-material-symbols-content-copy right-0 text-base-content opacity-10 hover:bg-base-content hover:opacity-80 m-3"
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
		/>
	</label>
</div>
