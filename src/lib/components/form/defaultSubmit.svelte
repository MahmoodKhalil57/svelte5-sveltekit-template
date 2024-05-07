<script lang="ts">
	import ButtonDefault from '$lib/components/ui/buttonDefault.svelte';

	let {
		class: Class = '',
		id = undefined,
		disabledButton = false,
	}: {
		class?: string;
		id?: string;
		disabledButton?: boolean;
	} = $props();

</script>

<ButtonDefault
	{id}
	value="Reset Password"
	class="btn-secondary btn w-3/4 max-w-[300px] capitalize sm:text-[100%] mt-2 md:mt-5 {Class}"
	dynamicDisabled={disabledButton}
>
	Submit
</ButtonDefault>
