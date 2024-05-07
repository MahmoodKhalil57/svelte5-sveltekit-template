<script lang="ts">
	// import { signOnGoogle } from '$lib/client/luciaClient';
	import ButtonDefault from '$lib/components/ui/buttonDefault.svelte';

	let {
		class: Class = '',
		id = ''
	}: {
		class?: string;
		id?: string;
	} = $props();
</script>

<ButtonDefault
	{id}
	form="none"
	class="btn-secondary text-base-100 bg-base-content border-0 btn w-3/4 max-w-[300px] capitalize sm:text-[100%] mt-2 md:mt-5  {Class}"
	onclick={() => {}}
>
	<div class="i-logos-google-icon"></div>
	<div class="text-sm">Continue with Google</div>
</ButtonDefault>
