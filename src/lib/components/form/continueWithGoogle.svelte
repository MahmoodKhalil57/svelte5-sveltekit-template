<script lang="ts">
	// import { signOnGoogle } from '$lib/client/luciaClient';
	import ButtonDefault from '$lib/components/ui/buttonDefault.svelte';

	export let innerClass = '';
</script>

<ButtonDefault
	form="none"
	innerClass="flex flex-row flex-nowrap whitespace-nowrap btn-ghost border-base-300 min-w-[250px] {innerClass}"
	onClick={() => {}}
>
	<div class="i-logos-google-icon" />
	<div class="text-sm">Continue with Google</div>
</ButtonDefault>
