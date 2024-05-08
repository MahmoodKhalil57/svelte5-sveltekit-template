<script lang="ts">
	import { apiSend, responseStatus } from '$lib/client/apiClient';
	import FormBuilder from '$lib/components/form/formBuilder.svelte';
	import { serverTimeRune } from '$lib/runes/testRune.svelte';

	let apiResponse:
		| {
				text: string;
				quoteAuthor: string;
				apiAuthor: string;
		  }
		| undefined = $state(undefined);
	const sendRequest = async () => {
		const res = await apiSend(fetch).testRouter.testGet.GET({});
		if (res.status === responseStatus.SUCCESS) {
			apiResponse = res.body.data.quote;
		}
	};
</script>

<svelte:head>
	<title>Svelte Template</title>
</svelte:head>

<section class="w-full flex flex-col justify-center items-center">
	<button onclick={sendRequest}> Test Api </button>
	{apiResponse ? JSON.stringify(apiResponse) : ''}

	<div class="flex-col gap-6 flex-center">Hello</div>

	<FormBuilder route="testRouter" procedure="testPost" />

	<div>
		Server time: {serverTimeRune.value}
	</div>

	<a href="/showcase?route=testRouter&procedure=testPost&templatePage=(app)/(index)">See code</a>
</section>
