<script lang="ts">
	import ButtonDefault from '$lib/components/ui/buttonDefault.svelte';

	export let disabledButton = false;
	export let id: string | undefined = undefined;
	export let Class: string = '';
</script>

<ButtonDefault
	{id}
	value="Reset Password"
	Class="btn-secondary btn w-3/4 max-w-[300px] capitalize sm:text-[100%] mt-2 md:mt-5 {Class}"
	dynamicDisabled={disabledButton}
>
	Submit
</ButtonDefault>
