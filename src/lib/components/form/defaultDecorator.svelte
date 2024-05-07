<script lang="ts">
	import { InputTypeEnum } from '$lib/utils/apiUtils/client/apiClientUtils';

	export let label: string | undefined = undefined;
	export let type: keyof typeof InputTypeEnum;
	export let id: string | undefined = undefined;
	export let text: string = '';
	export let Class: string = '';
	export let ContainerClass: string = '';
</script>

<div class="w-full flex flex-col items-center justify-center {ContainerClass}">
	{#if label}
		<span>{label}</span>
	{/if}
	{#if type === InputTypeEnum.DIVIDER}
		<div {id} class="divider {Class}">{text}</div>
	{/if}
</div>
