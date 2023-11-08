<script lang="ts">
	export let innerClass = '';
	export let form = '';
	export let value = '';
	export let dynamicDisabled = false;
	export let onClick = () => {};
	export let url = '';
</script>

{#if url}
	<a href={url}>
		{#if form === ''}
			<button class="btn {innerClass}" on:click={onClick} {value} disabled={dynamicDisabled}>
				<slot />
			</button>
		{:else}
			<button
				on:submit|preventDefault
				type="submit"
				class="btn {innerClass}"
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
	<button class="btn {innerClass}" on:click={onClick} {value} disabled={dynamicDisabled}>
		<slot />
	</button>
{:else}
	<button
		on:submit|preventDefault
		type="submit"
		class="btn {innerClass}"
		on:click={onClick}
		disabled={dynamicDisabled}
		{form}
		{value}
	>
		<slot />
	</button>
{/if}
