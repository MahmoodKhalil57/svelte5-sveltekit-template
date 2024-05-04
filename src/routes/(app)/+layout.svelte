<script lang="ts">
	import Footer from '$lib/components/layout/footer.svelte';
	import Header from '$lib/components/layout/header.svelte';
	import { Toaster } from 'svelte-french-toast';
</script>

<Header />
<main class="flex justify-center stretch min-h-page">
	<slot />
</main>
<Footer />

<Toaster />
