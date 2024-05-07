<script lang="ts">
	let { children } = $props();
	import Footer from '$lib/components/layout/footer.svelte';
	import Header from '$lib/components/layout/header.svelte';
	import Navigation from '$lib/components/layout/navigation.svelte';
	import DrawerContainer from '$lib/components/ui/DrawerContainer.svelte';
	import { onMount } from 'svelte';
	import { themeChange } from 'theme-change';

	onMount(() => {
		themeChange(false);
	});
</script>

<DrawerContainer closeBtn={true} drawerClass="bg-base-100" drawerId="main-menu-drawer">
	{#snippet mainChild()}
		<Header />
		<main class="z-10 relative flex justify-center w-full min-h-page">
			{@render children()}
		</main>
		<Footer />
	{/snippet}
	{#snippet drawerContentChild()}
		<Navigation menu />
	{/snippet}
</DrawerContainer>
