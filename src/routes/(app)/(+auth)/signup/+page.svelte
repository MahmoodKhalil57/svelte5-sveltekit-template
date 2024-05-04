<script lang="ts">
	import type { ComponentProps } from 'svelte';
	import FormBuilder from '$src/lib/components/form/formBuilder.svelte';
	import { responseStatus } from '$src/lib/utils/apiUtils/client/serverResponse';
	import { goto } from '$app/navigation';
	import ContinueWithGoogle from '$src/lib/components/form/continueWithGoogle.svelte';

	type FormComponent = ComponentProps<FormBuilder<'authRouter', 'signUpEmail'>>;
	type PreValidation = FormComponent['preValidation'];
	type OnSuccess = FormComponent['onSuccess'];

	export const preValidation: PreValidation = async (payload) => {
		if (!payload.password || payload.password === payload.confirmPassword) {
			return {
				validationSuccess: true,
				safePayload: {
					email: payload.email ?? '',
					firstName: payload.firstName ?? '',
					lastName: payload.lastName ?? '',
					password: payload.password ?? ''
				},
				response: undefined
			};
		}
		return {
			validationSuccess: false,
			safePayload: undefined,
			response: {
				errorMessage: 'Validation Error',
				status: responseStatus.VALIDATION_ERROR,
				errorIssues: [{ key: 'password', errorMessages: ['Passwords do not match'] }]
			}
		};
	};

	const onSuccess: OnSuccess = async ({ response }) => {
		goto('/signup/verify');
	};
</script>

<div class="flex flex-col w-full pt-10 pb-20">
	<h1
		class="px-2 self-center font-extrabold text-center text-[2rem] sm:text-[2.3rem] lg:text-[2.5rem] xl:text-[2.7rem]"
	>
		1. Send verification code
	</h1>

	<div class="w-full flex flex-col items-center justify-center">
		<FormBuilder route="authRouter" procedure="signUpEmail" {preValidation} {onSuccess} />
		<div class="w-full flex justify-center text-[13px]">
			<div>Already have an account?</div>
			<a href="/login" class="underline font-extrabold">Login.</a>
		</div>

		<div class="flex items-center justify-center w-full">
			<div class="flex flex-col items-center justify-center w-max">
				<div class="divider">OR</div>
				<ContinueWithGoogle Class="w-4/5 sm:w-3/5 xl:w-[24.3vw]" />
			</div>
		</div>
	</div>
</div>
