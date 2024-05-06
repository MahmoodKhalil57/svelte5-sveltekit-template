<script lang="ts">
	import { InputTypeEnum } from '$lib/utils/apiUtils/client/apiClientUtils';
	import type { Field } from '$lib/utils/apiUtils/server/ApiUtils.type.server';
	import ContinueWithGoogle from './continueWithGoogle.svelte';
	import DefaultDecorator from './defaultDecorator.svelte';
	import DefaultInput from './defaultInput.svelte';
	import DefaultLabel from './defaultLabel.svelte';
	import DefaultSubmit from './defaultSubmit.svelte';
	import TextAreaInput from './textAreaInput.svelte';

	export let field: Field;

	export let value = '';
	export let disabledButton = false;
</script>

{#if [InputTypeEnum.TEXT, InputTypeEnum.EMAIL, InputTypeEnum.PASSWORD].includes(field.type)}
	<DefaultInput
		label={field.label}
		type={field.type}
		placeHolder={field.placeHolder}
		id={field.id}
		Class={field.Class}
		bind:value
	/>
{:else if field.type === InputTypeEnum.TEXTAREA}
	<TextAreaInput
		label={field.label}
		placeHolder={field.placeHolder}
		id={field.id}
		Class={field.Class}
		bind:value
	/>
{:else if [InputTypeEnum.LINK, InputTypeEnum.TITLE].includes(field.type)}
	<DefaultLabel
		label={field.label}
		id={field.id}
		type={field.type}
		href={field.href}
		Class={field.Class}
		ContainerClass={field.ContainerClass}
		text={field.text}
	/>
{:else if field.type === InputTypeEnum.SUBMIT}
	<DefaultSubmit id={field.id} Class={field.Class} {disabledButton} />
{:else if field.type === InputTypeEnum.GOOGLESIGNIN}
	<ContinueWithGoogle id={field.id} Class={field.Class} />
{:else if field.type === InputTypeEnum.DIVIDER}
	<DefaultDecorator
		id={field.id}
		Class={field.Class}
		type={field.type}
		label={field.label}
		text={field.text}
		ContainerClass={field.ContainerClass}
	/>
{/if}
