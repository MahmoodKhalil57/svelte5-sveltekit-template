<script lang="ts">
	import { responseStatus } from '$lib/apiUtils/client/serverResponse';
	import { apiSend } from '$lib/client/apiClient';
	import { signOut } from '$lib/client/luciaClient';
	import ContinueWithGoogle from '$lib/components/form/continueWithGoogle.svelte';
	import { sessionUserStore } from '$lib/stores/userStore';
	let longurl = '';
	const test = async () => {
		console.log('hello');
		await apiSend(fetch).testRouter.testPost.POST({ name: longurl }, false);
	};

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

<div class="flex flex-wrap">
	<div class="flex-col gap-6 px-2 sm:pb-40 flex-center stretch">Hello</div>
	<div class="flex-col gap-6 px-2 sm:pb-40 flex-center stretch">URL Shortner</div>
	<label for="longUrl" class="p-1 font-bold">Long URL:</label>
	<input
		type="text"
		bind:value={longurl}
		placeholder="Type here"
		class="input input-bordered w-full max-w-xs p-2"
	/>
	<button class="btn glass" on:click={test}>Shorten</button>
</div>
{#if $sessionUserStore?.userId}
	<div
		on:keydown={() => signOut()}
		on:click={() => signOut()}
		role="button"
		tabindex="0"
		class="flex flex-row items-center justify-start gap-3 pl-3 font-extrabold underline cursor-pointer underline-offset-4"
	>
		<p>Sign Out</p>
	</div>
{:else}
	<ContinueWithGoogle innerClass="w-4/5 sm:w-3/5 xl:w-[24.3vw]" />
{/if}
