<script lang="ts">
	import { InputTypeEnum } from '$lib/utils/apiUtils/client/apiClientUtils';

	let {
		class: Class = '',
		label = undefined,
		id = undefined,
		text = '',
		ContainerClass = '',
		type
	}: {
		class?: string;
		label?: string;
		id?: string;
		text?: string;
		ContainerClass?: string;
		type: keyof typeof InputTypeEnum;
	} = $props();
</script>

<div class="w-full flex flex-col items-center justify-center {ContainerClass}">
	{#if label}
		<span>{label}</span>
	{/if}
	{#if type === InputTypeEnum.DIVIDER}
		<div {id} class="divider {Class}">{text}</div>
	{/if}
</div>
