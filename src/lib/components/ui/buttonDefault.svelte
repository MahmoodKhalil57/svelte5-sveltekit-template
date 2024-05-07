<script lang="ts">
	import type { Snippet } from 'svelte';

	let {
		class: Class = '',
		form = '',
		value = '',
		dynamicDisabled = false,
		onclick = () => {},
		url = '',
		id = undefined,
		target = undefined,
		children = undefined
	}: {
		class?: string;
		form?: string;
		value?: string;
		dynamicDisabled?: boolean;
		onclick?: () => void;
		url?: string;
		id?: string;
		target?: string;
		children?: Snippet;
	} = $props();
</script>

{#if url}
	<a href={url} {target}>
		{#if form === ''}
			<button {id} class="btn {Class}" {onclick} {value} disabled={dynamicDisabled}>
				{@render children?.()}
			</button>
		{:else}
			<button
				{id}
				type="submit"
				class="btn {Class}"
				{onclick}
				disabled={dynamicDisabled}
				{form}
				{value}
			>
				{@render children?.()}
			</button>
		{/if}
	</a>
{:else if form === ''}
	<button {id} class="btn {Class}" {onclick} {value} disabled={dynamicDisabled}>
		{@render children?.()}
	</button>
{:else}
	<button
		{id}
		type="submit"
		class="btn {Class}"
		{onclick}
		disabled={dynamicDisabled}
		{form}
		{value}
	>
		{@render children?.()}
	</button>
{/if}
