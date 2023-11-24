<script lang="ts">
	import { InputTypeEnum } from '$lib/apiUtils/apiStructure';
	export let label: string;
	export let type: InputTypeEnum;
	export let placeHolder: string = '';
	export let id: string = '';
	export let value: string = '';
</script>

<label class="w-full">
	<span class="hidden">{label}</span>
	{#if type === InputTypeEnum.TEXT}
		<input
			placeholder={placeHolder}
			class="w-full !outline-none input input-bordered"
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
			class="w-full input placeholder-base-300 bg-gray-100 !outline-none !border-none"
			bind:value
		/>
	{/if}
</label>
