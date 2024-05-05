<script lang="ts">
	import { apiSend, responseStatus } from '$src/lib/client/apiClient';
	import FormBuilder from '$src/lib/components/form/formBuilder.svelte';
	import { serverTimeStore } from '$src/lib/stores/testStore';

	let apiRespnseReceived = false;
	const sendRequest = async () => {
		const res = await apiSend(fetch).testRouter.testGet.GET({ name: 'test' }, false);
		if (res.status === responseStatus.SUCCESS) {
			apiRespnseReceived = true;
		}
	};
</script>

<section class="w-full flex flex-col justify-center items-center">
	<button on:click={sendRequest}> Test Api </button>
	{apiRespnseReceived ? 'SUCCESS' : ''}

	<div class="flex-col gap-6 flex-center">Hello</div>

	<FormBuilder route="testRouter" procedure="testPost" />

	<div>
		Server time: {$serverTimeStore}
	</div>

	<a href="/showcase?route=testRouter&procedure=testPost&templatePage=(app)/(index)">See code</a>
</section>
