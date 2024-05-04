<script lang="ts">
	import FormBuilder from '$src/lib/components/form/formBuilder.svelte';
</script>

<div class="flex flex-col w-full pt-10 pb-20">
	<h1
		class="px-2 self-center font-extrabold text-center text-[2rem] sm:text-[2.3rem] lg:text-[2.5rem] xl:text-[2.7rem]"
	>
		2. Verify Code
	</h1>
	<div class="w-full flex flex-col items-center justify-center">
		<FormBuilder route="authRouter" procedure="verifyCode" />
	</div>
</div>
