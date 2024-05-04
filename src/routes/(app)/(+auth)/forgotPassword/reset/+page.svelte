<script lang="ts">
	import { responseStatus } from '$api/root.server';
	import FormBuilder from '$src/lib/components/form/formBuilder.svelte';
	import type { ComponentProps } from 'svelte';
	import type { PageData } from './$types';

	type FormComponent = ComponentProps<FormBuilder<'authRouter', 'resetPasswordEmail'>>;
	type ExtraValidation = FormComponent['extraValidation'];

	export let data: PageData;

	export const extraValidation: ExtraValidation = async (payload) =>
		payload.password === payload.confirmPassword
			? {
					validationSuccess: true,
					safePayload: {
						...payload,
						code: data.codeId
					},
					response: undefined
				}
			: {
					validationSuccess: false,
					safePayload: undefined,
					response: {
						errorMessage: 'Validation Error',
						status: responseStatus.VALIDATION_ERROR,
						errorIssues: [{ key: 'password', errorMessages: ['Passwords do not match'] }]
					}
				};
</script>

<div class="flex flex-col w-full pt-10 pb-2">
	<h1
		class="px-2 self-center font-extrabold text-center text-[2rem] sm:text-[2.3rem] lg:text-[2.5rem] xl:text-[2.7rem]"
	>
		3. Reset Password
	</h1>
	<div class="flex flex-col items-center justify-center">
		<FormBuilder route="authRouter" procedure="resetPasswordEmail" {extraValidation} />
	</div>
</div>
