<script lang="ts">
	import { InputTypeEnum } from '$lib/utils/apiUtils/client/apiClientUtils';

	let {
		class: Class = '',
		label = undefined,
		id = undefined,
		placeHolder = '',
		value = $bindable(''),
		type,
	}: {
		class?: string;
		label?: string;
		id?: string;
		placeHolder?: string;
		value?: string;
		type: keyof typeof InputTypeEnum;
	} = $props();

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
