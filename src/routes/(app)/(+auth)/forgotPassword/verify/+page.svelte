<script lang="ts">
	import type { ComponentProps } from 'svelte';
	import { goto } from '$app/navigation';
	import FormBuilder from '$src/lib/components/form/formBuilder.svelte';

	type FormComponent = ComponentProps<FormBuilder<'authRouter', 'verifyCode'>>;
	type OnSuccess = FormComponent['onSuccess'];

	export const onSuccess: OnSuccess = async ({ response }) => {
		goto('/forgotPassword/reset?code=' + response.body.data.code.trim());
	};
</script>

<div class="flex flex-col w-full pt-10 pb-20">
	<h1
		class="px-2 self-center font-extrabold text-center text-[2rem] sm:text-[2.3rem] lg:text-[2.5rem] xl:text-[2.7rem]"
	>
		2. Reset Password
	</h1>
	<div class="flex flex-col items-center justify-center">
		<FormBuilder route="authRouter" procedure="verifyCode" {onSuccess} />
	</div>
</div>
