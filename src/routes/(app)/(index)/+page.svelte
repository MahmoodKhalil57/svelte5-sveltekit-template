<script lang="ts">
	import { responseStatus } from '$lib/apiUtils/client/serverResponse';
	import { apiSend } from '$lib/client/apiClient';

	let apiRespnseReceived = false;
	const sendRequest = async () => {
		const res = await apiSend(fetch).testRouter.testGet.GET({ name: 'test' }, false);
		if (res.status === responseStatus.SUCCESS) {
			apiRespnseReceived = true;
		}
	};
</script>

<button on:click={sendRequest}> Test Api </button>
{apiRespnseReceived ? 'SUCCESS' : ''}

<div class="flex-col gap-6 px-2 sm:pb-40 flex-center stretch">Hello</div>
