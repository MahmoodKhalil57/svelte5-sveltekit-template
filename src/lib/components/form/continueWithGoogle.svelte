<script lang="ts">
	// import { signOnGoogle } from '$lib/client/luciaClient';
	import ButtonDefault from '$lib/components/ui/buttonDefault.svelte';

	export let id = '';
	export let Class = '';
</script>

<ButtonDefault
	{id}
	form="none"
	Class="btn-secondary bg-white border-0 btn w-3/4 max-w-[300px] capitalize sm:text-[100%] mt-2 md:mt-5  {Class}"
	onClick={() => {}}
>
	<div class="i-logos-google-icon" />
	<div class="text-sm">Continue with Google</div>
</ButtonDefault>
