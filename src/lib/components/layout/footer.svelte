<script lang="ts">
	import Logo from '$lib/components/template/logo.svelte';
	import { fade } from 'svelte/transition';
	import { apiSend, responseStatus } from '$lib/client/apiClient';
</script>

<footer
	class="z-20 relative flex flex-col justify-between w-full gap-8 px-10 py-4 border-t sm:gap-0 sm:flex-row bg-base-200 text-base-content border-base-300 min-h-footer"
>
	<div class="flex flex-col items-center sm:flex-row gap-3">
		<a href="/">
			<Logo />
		</a>

		{#await apiSend(fetch).testRouter.testGet.GET({})}
			<div></div>
		{:then response}
			{#if response.status === responseStatus.SUCCESS}
				{@const quote = response.body.data.quote}
				<div
					transition:fade={{ delay: 250, duration: 300 }}
					class="flex flex-col gap-2 text-center sm:gap-0"
				>
					<x>"{quote?.text}"</x>
					<x class="flex flex-col sm:flex-row">
						<b>- {quote?.quoteAuthor}</b>
						<i class="opacity-70">
							<x class="hidden sm:inline">, </x>
							<x>{quote?.apiAuthor}</x>
						</i>
					</x>
				</div>
			{:else}
				<a href="https://github.com/MahmoodKhalil57">
					Please report this issue https://github.com/MahmoodKhalil57
				</a>
			{/if}
		{/await}
	</div>
	<div class="flex justify-center w-full sm:w-auto">
		<div class="flex gap-4 text-3xl">
			<!-- svelte-ignore a11y_missing_content -->
			<a href="https://github.com/MahmoodKhalil57/svelte5-sveltekit-template" class="i-mdi-github"
			></a>
		</div>
	</div>
</footer>
