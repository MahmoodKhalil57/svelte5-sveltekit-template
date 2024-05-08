<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { userAttributesRune } from '$lib/runes/userRune.svelte';

	const { children } = $props();

	$effect(() => {
		if ($page && userAttributesRune.value) {
			goto('/');
		}
	});
</script>

{@render children()}
