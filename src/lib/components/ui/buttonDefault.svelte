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
		child = undefined
	}: {
		class?: string;
		form?: string;
		value?: string;
		dynamicDisabled?: boolean;
		onclick?: () => void;
		url?: string;
		id?: string;
		target?: string;
		child?: Snippet;
	} = $props();
</script>

{#if url}
	<a href={url} {target}>
		{#if form === ''}
			<button {id} class="btn {Class}" {onclick} {value} disabled={dynamicDisabled}>
				{@render child?.()}
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
				{@render child?.()}
			</button>
		{/if}
	</a>
{:else if form === ''}
	<button {id} class="btn {Class}" {onclick} {value} disabled={dynamicDisabled}>
		{@render child?.()}
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
		{@render child?.()}
	</button>
{/if}
