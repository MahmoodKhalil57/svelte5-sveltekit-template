<script lang="ts">
	export let flashData:
		| {
				message?: string;
				color?: string;
				errorMessageList?: string[];
		  }
		| undefined
		| null;
</script>

{#if flashData?.message}
	<div
		class="flex flex-col items-center justify-center text-xs pointer-events-none {flashData?.color
			? flashData?.color
			: 'text-red-400'}"
	>
		<p class="text-center">
			{flashData?.message}
		</p>
		{#if flashData.errorMessageList}
			<ul class="w-full">
				{#each flashData.errorMessageList as errorMessage}
					<li class="list-disc ml-3">{errorMessage}</li>
				{/each}
			</ul>
		{/if}
	</div>
{/if}
