<script lang="ts">
	import type { ComponentProps } from 'svelte';
	import FormBuilder from '$lib/components/form/formBuilder.svelte';
	import { responseStatus } from '$lib/utils/apiUtils/client/serverResponse';

	type FormComponent = ComponentProps<FormBuilder<'authRouter', 'signUpEmail'>>;
	type PreValidation = FormComponent['preValidation'];

	export const preValidation: PreValidation = async (payload) =>
		!payload.password || payload.password === payload.confirmPassword
			? {
					validationSuccess: true,
					safePayload: {
						email: payload.email ?? '',
						firstName: payload.firstName ?? '',
						lastName: payload.lastName ?? '',
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

<svelte:head>
	<title>Signup</title>
</svelte:head>

<FormBuilder route="authRouter" procedure="signUpEmail" {preValidation} class="!pt-10 !pb-20" />

<a href="/showcase?route=authRouter&procedure=signUpEmail&templatePage=(app)/(%2Bauth)/signup">
	See code
</a>
