<script lang="ts">
	// import { InputTypeEnum } from '$lib/components/form/inputType';

	export let label: string = '';
	export let placeHolder: string = '';
	export let id: string | undefined = undefined;
	export let value: string = '';
	export let Class: string = '';
</script>

<label class="w-full">
	{#if label}
		<span>{label}:</span>
	{/if}

	<textarea
		class="!outline-none textarea textarea-bordered w-full {Class}"
		placeholder={placeHolder}
		{id}
		name={id}
		bind:value
	/>
</label>
