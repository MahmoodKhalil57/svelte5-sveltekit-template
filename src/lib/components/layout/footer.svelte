<script lang="ts">
	import { onMount } from 'svelte';
	import Logo from '$lib/components/template/logo.svelte';
	import { fade } from 'svelte/transition';

	let quote: { text: string; quoteAuthor: string; apiAuthor: string } | undefined;

	const getQuote = async () => {
		const res = await fetch('https://type.fit/api/quotes');
		const data = await res.json();
		// random number from 0-15
		const random = Math.floor(Math.random() * 15);
		const authorArray = data[random].author.split(', ');

		quote = {
			text: data[random].text,
			quoteAuthor: authorArray[0],
			apiAuthor: authorArray[1]
		};
	};
	onMount(() => {
		getQuote();
	});
</script>

<footer
	class="flex flex-col justify-between w-full h-full gap-8 px-10 py-4 border-t sm:gap-0 sm:flex-row bg-base-200 text-base-content border-base-300"
>
	<div class="flex flex-col items-center sm:flex-row">
		<a href="/">
			<Logo />
		</a>

		{#if quote}
			<div
				transition:fade={{ delay: 250, duration: 300 }}
				class="flex flex-col gap-2 text-center sm:gap-0"
			>
				<x>"{quote?.text}"</x>
				<x class="flex flex-col sm:flex-row"
					><b>- {quote?.quoteAuthor}</b><i class="opacity-70"
						><x class="hidden sm:inline">, </x><x>{quote?.apiAuthor}</x></i
					></x
				>
			</div>
		{/if}
	</div>
	<div class="flex justify-center w-full sm:w-auto">
		<div class="flex gap-4 text-3xl">
			<!-- svelte-ignore a11y-missing-content -->
			<a href="https://github.com/MahmoodKhalil57/svelteTemplateV1" class="i-mdi-github" />
		</div>
	</div>
</footer>
