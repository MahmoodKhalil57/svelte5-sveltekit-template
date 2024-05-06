<script lang="ts">
	import { apiSend, responseStatus } from '$lib/client/apiClient';
	import FormBuilder from '$lib/components/form/formBuilder.svelte';
	import { serverTimeStore } from '$lib/stores/testStore';

	let apiResponse:
		| {
				text: string;
				quoteAuthor: string;
				apiAuthor: string;
		  }
		| undefined = undefined;
	const sendRequest = async () => {
		const res = await apiSend(fetch).testRouter.testGet.GET({});
		if (res.status === responseStatus.SUCCESS) {
			apiResponse = res.body.data.quote;
		}
	};
</script>

<section class="w-full flex flex-col justify-center items-center">
	<button on:click={sendRequest}> Test Api </button>
	{apiResponse ? JSON.stringify(apiResponse) : ''}

	<div class="flex-col gap-6 flex-center">Hello</div>

	<FormBuilder route="testRouter" procedure="testPost" />

	<div>
		Server time: {$serverTimeStore}
	</div>

	<a href="/showcase?route=testRouter&procedure=testPost&templatePage=(app)/(index)">See code</a>
</section>
