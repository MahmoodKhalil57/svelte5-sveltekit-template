<script lang="ts">
	import Logo from '$lib/components/template/logo.svelte';
	import Navigation from '$lib/components/layout/navigation.svelte';
	import { signOut } from '$lib/client/luciaClient';
	import { userAttributesStore } from '$lib/stores/userStore';
	import DarkModeToggle from '$lib/components/ui/DarkModeToggle.svelte';
</script>

<header class="z-20 relative header min-h-header w-full">
	<div class="relative flex justify-center sm:justify-between navbar bg-base-100">
		<a href="/"><Logo /></a>
		<div class="flex-none hidden sm:block">
			<ul class="gap-3 px-1 text-lg menu menu-horizontal">
				<Navigation />
				<li>
					<div class="!bg-inherit p-0">
						{#if $userAttributesStore?.id}
							<div
								on:keydown={() => signOut()}
								on:click={() => signOut()}
								role="button"
								tabindex="0"
								class="btn btn-accent"
							>
								Sign Out
							</div>
						{:else}
							<a href="/login" class="btn btn-accent">Login</a>
						{/if}
					</div>
				</li>
				<li class="flex items-center justify-center">
					<DarkModeToggle themes={['light', 'forest']} />
				</li>
			</ul>
		</div>
		<div class="absolute flex w-full pointer-events-none sm:hidden">
			<label
				for="main-menu-drawer"
				class="mx-6 text-3xl cursor-pointer pointer-events-auto hover:scale-105 drawer-button i-material-symbols-list-rounded"
			/>
		</div>
	</div>
</header>
