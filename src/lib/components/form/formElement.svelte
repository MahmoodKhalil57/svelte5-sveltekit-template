<script lang="ts">
	import { InputTypeEnum } from '$src/lib/utils/apiUtils/client/apiClientUtils';
	import type { Field } from '$src/lib/utils/apiUtils/server/ApiUtils.type.server';
	import DefaultInput from './defaultInput.svelte';
	import TextAreaInput from './textAreaInput.svelte';

	export let field: Field;

	export let value = '';
</script>

{#if field.type === InputTypeEnum.TEXT}
	<DefaultInput
		label={field.label}
		type={field.type}
		placeHolder={field.placeHolder}
		id={field.id}
		bind:value
	/>
{:else if field.type === InputTypeEnum.EMAIL}
	<DefaultInput
		label={field.label}
		type={field.type}
		placeHolder={field.placeHolder}
		id={field.id}
		bind:value
	/>
{:else if field.type === InputTypeEnum.TEXTAREA}
	<TextAreaInput label={field.label} placeHolder={field.placeHolder} id={field.id} bind:value />
{/if}
