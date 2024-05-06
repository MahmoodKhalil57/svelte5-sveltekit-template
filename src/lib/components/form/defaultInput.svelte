<script lang="ts">
	import { InputTypeEnum } from '$lib/utils/apiUtils/client/apiClientUtils';

	export let label: string = '';
	export let type: keyof typeof InputTypeEnum;
	export let placeHolder: string = '';
	export let id: string | undefined = undefined;
	export let value: string = '';
	export let Class: string = '';
</script>

<label class="w-full">
	{#if label}
		<span>{label}</span>
	{/if}
	{#if type === InputTypeEnum.TEXT}
		<input
			placeholder={placeHolder}
			class="w-full !outline-none input input-bordered {Class}"
			type="text"
			{id}
			name={id}
			bind:value
		/>
	{:else if type === InputTypeEnum.EMAIL}
		<input
			{id}
			type="email"
			name={id}
			placeholder={placeHolder}
			class="w-full !outline-none input input-bordered {Class}"
			bind:value
		/>
	{:else if type === InputTypeEnum.PASSWORD}
		<input
			{id}
			type="password"
			name={id}
			placeholder={placeHolder}
			class="w-full !outline-none input input-bordered {Class}"
			bind:value
		/>
	{/if}
</label>
