<script lang="ts">
	import FormBuilder from '$lib/components/form/formBuilder.svelte';
</script>

<svelte:head>
	<title>Verify</title>
</svelte:head>

<FormBuilder route="authRouter" procedure="verifyEmailSignup" Class="!pt-10 !pb-20" />

<a
	href="/showcase?route=authRouter&procedure=verifyEmailSignup&templatePage=(app)/(%2Bauth)/signup/verify"
>
	See code
</a>
