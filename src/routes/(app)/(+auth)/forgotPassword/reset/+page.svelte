<script lang="ts">
	import FormBuilder from '$lib/components/form/formBuilder.svelte';
	import type { ComponentProps } from 'svelte';
	import { responseStatus } from '$lib/client/apiClient';

	type FormComponent = ComponentProps<FormBuilder<'authRouter', 'resetPasswordEmail'>>;
	type PreValidation = FormComponent['preValidation'];

	let { data } = $props();

	const preValidation: PreValidation = async (payload) =>
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

<svelte:head>
	<title>Reset</title>
</svelte:head>

<FormBuilder
	route="authRouter"
	procedure="resetPasswordEmail"
	{preValidation}
	class="!pt-10 !pb-20"
/>

<a
	href="/showcase?route=authRouter&procedure=resetPasswordEmail&templatePage=(app)/(%2Bauth)/forgotPassword/reset"
>
	See code
</a>
