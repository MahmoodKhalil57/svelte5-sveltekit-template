<script lang="ts">
	import FormBuilder from '$src/lib/components/form/formBuilder.svelte';
	import type { ComponentProps } from 'svelte';
	import type { PageData } from './$types';
	import { responseStatus } from '$src/lib/client/apiClient';

	type FormComponent = ComponentProps<FormBuilder<'authRouter', 'resetPasswordEmail'>>;
	type PreValidation = FormComponent['preValidation'];

	export let data: PageData;

	export const preValidation: PreValidation = async (payload) =>
		!payload.password || payload.password === payload.confirmPassword
			? {
					validationSuccess: true,
					safePayload: {
						code: data.codeId ?? '',
						password: payload.password ?? ''
					}
				}
			: {
					validationSuccess: false,
					response: {
						errorMessage: 'Validation Error',
						status: responseStatus.VALIDATION_ERROR,
						errorIssues: [{ key: 'password', errorMessages: ['Passwords do not match'] }]
					}
				};
</script>

<FormBuilder
	route="authRouter"
	procedure="resetPasswordEmail"
	{preValidation}
	Class="!pt-10 !pb-20"
/>

<a
	href="/showcase?route=authRouter&procedure=resetPasswordEmail&templatePage=(app)/(%2Bauth)/forgotPassword/reset"
>
	See code
</a>
