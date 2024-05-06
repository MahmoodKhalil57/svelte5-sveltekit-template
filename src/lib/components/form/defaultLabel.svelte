<script lang="ts">
	import { InputTypeEnum } from '$lib/utils/apiUtils/client/apiClientUtils';

	export let label: string = '';
	export let type: keyof typeof InputTypeEnum;
	export let id: string | undefined = undefined;
	export let text: string = '';
	export let href: string = '';
	export let Class: string = '';
	export let ContainerClass: string = '';
</script>

<div class="w-full flex flex-col items-center justify-center {ContainerClass}">
	{#if label}
		<span>{label}</span>
	{/if}
	{#if type === InputTypeEnum.LINK}
		<a {id} {href} class="link {Class}">{text || href}</a>
	{:else if type === InputTypeEnum.TITLE}
		<h1
			{id}
			class="px-2 self-center font-extrabold text-center text-[2rem] sm:text-[2.3rem] lg:text-[2.5rem] xl:text-[2.7rem] {Class}"
		>
			{text}
		</h1>
	{/if}
</div>
