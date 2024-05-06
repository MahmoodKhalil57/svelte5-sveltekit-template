<script lang="ts">
	import { browser } from '$app/environment';

	export let Class = '';

	export let select = false;

	let themes = browser
		? (window.document.documentElement.getAttribute('data-themes') as string)
		: '[]';
</script>

{#if select}
	<select
		data-choose-theme
		class="select select-bordered w-full max-w-xs mx-2 !bg-base-100 !outline-none active:scale-95 !cursor-pointer"
	>
		{#each themes as theme}
			<option class="!cursor-pointer" value={theme}
				>{theme.charAt(0).toUpperCase() + theme.slice(1)}</option
			>
		{/each}
	</select>
{:else}
	<button
		class="!bg-transparent p-2 opacity-75 hover:opacity-100 {Class}"
		data-toggle-theme={themes}
	>
		<span class="i-carbon-sun dark:i-carbon-moon text-lg" />
	</button>
{/if}
