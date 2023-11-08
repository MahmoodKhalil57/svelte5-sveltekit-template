<script lang="ts">
	// import { InputTypeEnum } from '$lib/components/form/inputType';

	export let label: string;
	export let placeHolder: string = '';
	export let id: string = '';
	export let value: string = '';
</script>

<label class="w-full"
	>{label}:<br />

	<textarea
		class="!outline-none textarea textarea-bordered w-full"
		placeholder={placeHolder}
		{id}
		name={id}
		bind:value
	/></label
>
