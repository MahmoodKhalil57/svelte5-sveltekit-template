<script lang="ts">
	import FormBuilder from '$lib/components/form/formBuilder.svelte';
</script>

<svelte:head>
	<title>Forgot Password</title>
</svelte:head>

<FormBuilder route="authRouter" procedure="sendResetPasswordEmail" Class="!pt-10 !pb-20" />

<a
	href="/showcase?route=authRouter&procedure=sendResetPasswordEmail&templatePage=(app)/(%2Bauth)/forgotPassword"
>
	See code
</a>
