<script lang="ts">
	export let Class = '';
	export let form = '';
	export let value = '';
	export let dynamicDisabled = false;
	export let onClick = () => {};
	export let url = '';
	export let id: string | undefined = undefined;
	export let target: string | undefined = undefined;
</script>

{#if url}
	<a href={url} {target}>
		{#if form === ''}
			<button {id} class="btn {Class}" on:click={onClick} {value} disabled={dynamicDisabled}>
				<slot />
			</button>
		{:else}
			<button
				{id}
				on:submit|preventDefault
				type="submit"
				class="btn {Class}"
				on:click={onClick}
				disabled={dynamicDisabled}
				{form}
				{value}
			>
				<slot />
			</button>
		{/if}
	</a>
{:else if form === ''}
	<button {id} class="btn {Class}" on:click={onClick} {value} disabled={dynamicDisabled}>
		<slot />
	</button>
{:else}
	<button
		{id}
		on:submit|preventDefault
		type="submit"
		class="btn {Class}"
		on:click={onClick}
		disabled={dynamicDisabled}
		{form}
		{value}
	>
		<slot />
	</button>
{/if}
