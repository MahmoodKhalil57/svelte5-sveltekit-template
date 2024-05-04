<script lang="ts">
	import { InputTypeEnum } from '$src/lib/utils/apiUtils/client/apiClientUtils';

	export let label: string = '';
	export let type: keyof typeof InputTypeEnum;
	export let id: string = '';
	export let text: string = '';
	export let href: string = '';
</script>

<div class="w-full flex flex-col">
	{#if label}
		<span>{label}</span>
	{/if}
	{#if type === InputTypeEnum.LINK}
		<a {id} {href} class="link place-self-end">{text || href}</a>
	{/if}
</div>
