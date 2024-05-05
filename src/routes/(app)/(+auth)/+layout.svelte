<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { userAttributesStore } from '$src/lib/stores/userStore';
	import { onDestroy, onMount } from 'svelte';
	import { derived, type Unsubscriber } from 'svelte/store';

	const redirectUser = derived([page, userAttributesStore], ([$page, $userAttributesStore]) => ({
		$page,
		$userAttributesStore
	}));

	let redirectUserUnsubscriber: Unsubscriber | undefined;
	onMount(() => {
		redirectUserUnsubscriber = redirectUser.subscribe(({ $page, $userAttributesStore }) => {
			if ($userAttributesStore) {
				goto('/');
			}
		});
	});
	onDestroy(() => {
		redirectUserUnsubscriber?.();
	});
</script>

<slot />
