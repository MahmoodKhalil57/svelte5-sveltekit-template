<script lang="ts">
	import { InputTypeEnum } from '$src/lib/utils/apiUtils/client/apiClientUtils';
	import type { Field } from '$src/lib/utils/apiUtils/server/ApiUtils.type.server';
	import DefaultInput from './defaultInput.svelte';
	import DefaultLabel from './defaultLabel.svelte';
	import TextAreaInput from './textAreaInput.svelte';

	export let field: Field;

	export let value = '';
</script>

{#if [InputTypeEnum.TEXT, InputTypeEnum.EMAIL, InputTypeEnum.PASSWORD].includes(field.type)}
	<DefaultInput
		label={field.label}
		type={field.type}
		placeHolder={field.placeHolder}
		id={field.id}
		bind:value
	/>
{:else if field.type === InputTypeEnum.TEXTAREA}
	<TextAreaInput label={field.label} placeHolder={field.placeHolder} id={field.id} bind:value />
{:else if field.type === InputTypeEnum.LINK}
	<DefaultLabel
		label={field.label}
		id={field.id}
		type={field.type}
		href={field.href}
		text={field.text}
	/>
{/if}
