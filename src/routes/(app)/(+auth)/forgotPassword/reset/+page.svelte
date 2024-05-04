<script lang="ts">
	import { responseStatus } from '$api/root.server';
	import FormBuilder from '$src/lib/components/form/formBuilder.svelte';
	import type { ComponentProps } from 'svelte';
	import type { PageData } from './$types';

	type FormComponent = ComponentProps<FormBuilder<'authRouter', 'resetPasswordEmail'>>;
	type PreValidation = FormComponent['preValidation'];

	export let data: PageData;

	export const preValidation: PreValidation = async (payload) => {
		if (payload.password === payload.confirmPassword) {
			return {
				validationSuccess: true,
				safePayload: {
					code: data.codeId ?? '',
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
</script>

<div class="flex flex-col w-full pt-10 pb-2">
	<h1
		class="px-2 self-center font-prebold text-center text-[2rem] sm:text-[2.3rem] lg:text-[2.5rem] xl:text-[2.7rem]"
	>
		3. Reset Password
	</h1>
	<div class="flex flex-col items-center justify-center">
		<FormBuilder route="authRouter" procedure="resetPasswordEmail" {preValidation} />
	</div>
</div>
