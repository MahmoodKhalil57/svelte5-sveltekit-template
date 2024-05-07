<script lang="ts">
	import { InputTypeEnum } from '$lib/utils/apiUtils/client/apiClientUtils';

	let {
		class: Class = '',
		id = undefined,
		label = '',
		text = '',
		href = '',
		containerClass = '',
		type
	}: {
		class?: string;
		id?: string;
		label?: string;
		text?: string;
		href?: string;
		containerClass?: string;
		type: keyof typeof InputTypeEnum;
	} = $props();
</script>

<div class="w-full flex flex-col items-center justify-center {containerClass}">
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
