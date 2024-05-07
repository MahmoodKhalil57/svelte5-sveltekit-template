<script lang="ts">
	import FormBuilder from '$lib/components/form/formBuilder.svelte';
</script>

<svelte:head>
	<title>Login</title>
</svelte:head>

<FormBuilder route="authRouter" procedure="signInEmail" class="!pt-10 !pb-20" />

<a href="/showcase?route=authRouter&procedure=signInEmail&templatePage=(app)/(%2Bauth)/login">
	See code
</a>
