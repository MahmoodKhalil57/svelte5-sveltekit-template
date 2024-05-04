<script lang="ts">
	import { goto } from '$app/navigation';
	import FormBuilder from '$src/lib/components/form/formBuilder.svelte';
	import type { ComponentProps } from 'svelte';

	type FormComponent = ComponentProps<FormBuilder<'authRouter', 'sendResetPasswordEmail'>>;
	type OnSuccess = FormComponent['onSuccess'];

	export const onSuccess: OnSuccess = async ({ response }) => {
		goto('/forgotPassword/verify');
	};
</script>

<div class="flex flex-col w-full pt-10 pb-20">
	<h1
		class="px-2 self-center font-extrabold text-center text-[2rem] sm:text-[2.3rem] lg:text-[2.5rem] xl:text-[2.7rem]"
	>
		1. Reset Password
	</h1>
	<div class="flex flex-col items-center justify-center">
		<FormBuilder route="authRouter" procedure="sendResetPasswordEmail" />
	</div>
</div>
