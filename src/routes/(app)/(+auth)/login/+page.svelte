<script lang="ts">
	import ContinueWithGoogle from '$src/lib/components/form/continueWithGoogle.svelte';
	import FormBuilder from '$src/lib/components/form/formBuilder.svelte';
</script>

<div class="flex flex-col w-full pt-10 pb-20">
	<h1
		class="px-2 self-center font-extrabold text-center text-[2rem] sm:text-[2.3rem] lg:text-[2.5rem] xl:text-[2.7rem]"
	>
		Login
	</h1>
	<div class="w-full flex flex-col justify-center items-center">
		<FormBuilder route="authRouter" procedure="signInEmail" />
		<div class="w-full flex justify-center text-[13px]">
			<div>Dont have an account?</div>
			<a href="/signup" class="underline font-extrabold">Create an account.</a>
		</div>

		<div class="flex items-center justify-center w-full">
			<div class="flex flex-col items-center justify-center w-max">
				<div class="divider">OR</div>
				<ContinueWithGoogle Class="w-4/5 sm:w-3/5 xl:w-[24.3vw]" />
			</div>
		</div>
	</div>
</div>
