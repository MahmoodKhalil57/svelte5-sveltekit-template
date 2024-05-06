<script lang="ts">
	import { browser } from '$app/environment';

	export let Class = '';

	export let select = false;

	let themes = JSON.parse(
		browser ? (window.document.documentElement.getAttribute('data-themes') as string) : '[]'
	) as string[];

	const getDataToggleTheme = (node: HTMLElement) => {
		node.setAttribute('data-toggle-theme', themes.join(','));
	};

	const getDataSelectTheme = (node: HTMLElement) => {
		node.setAttribute('data-choose-theme', themes.join(','));
		themes.forEach((theme) => {
			const optionDiv = document.createElement('option');
			optionDiv.classList.add('!cursor-pointer');
			optionDiv.value = theme;
			optionDiv.textContent = theme.charAt(0).toUpperCase() + theme.slice(1);
			node.appendChild(optionDiv);
		});
		node.firstChild?.remove();
	};
</script>

<svelte:head>
	<script>
		let themes = ['light', 'forest'];

		if (themes.length) {
			window.document.documentElement.setAttribute('data-themes', JSON.stringify(themes));
		}

		const localTheme = window.localStorage.getItem('theme');
		const hasTheme = typeof localTheme == 'string' ? localTheme : null;

		if (hasTheme && localTheme) {
			window.localStorage.setItem('theme', localTheme);
			window.document.documentElement.setAttribute('data-theme', localTheme);
		} else {
			// get preferred color scheme
			const darkQuery = window.matchMedia(`(prefers-color-scheme: dark)`);
			const theme = darkQuery.matches ? themes[1] : themes[0];

			window.localStorage.setItem('theme', theme);
			window.document.documentElement.setAttribute('data-theme', theme);
		}
	</script>
</svelte:head>

{#if select}
	<select
		use:getDataSelectTheme
		class="select select-bordered w-full max-w-xs mx-2 !bg-base-100 !outline-none active:scale-95 !cursor-pointer"
	>
		<option value="Theme">Theme</option>
	</select>
{:else}
	<button class="!bg-transparent p-2 opacity-75 hover:opacity-100 {Class}" use:getDataToggleTheme>
		<span class="i-carbon-sun dark:i-carbon-moon text-lg" />
	</button>
{/if}
