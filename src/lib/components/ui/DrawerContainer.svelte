<script lang="ts">
	import { navigating } from '$app/stores';
	import type { Unsubscriber } from 'svelte/store';
	import { onMount, onDestroy, type Snippet } from 'svelte';
	import { freezeScrollRune } from '$lib/runes/cssRunes.svelte';

	let {
		checked = $bindable(false),
		mobile = false,
		right = false,
		closeBtn = false,
		backdropScreen = false,
		drawerClass = '',
		backdropClass = '',
		drawerId,
		mainChild,
		drawerContentChild
	}: {
		checked?: boolean;
		mobile?: boolean;
		right?: boolean;
		closeBtn?: boolean;
		backdropScreen?: boolean;
		drawerClass?: string;
		backdropClass?: string;
		drawerId: string;
		mainChild: Snippet;
		drawerContentChild: Snippet;
	} = $props();

	let navigatingUnsubscriber: Unsubscriber | undefined;

	onMount(() => {
		navigatingUnsubscriber = navigating.subscribe((val) => {
			if (val?.from?.url.pathname !== val?.to?.url.pathname) {
				checked = false;
			}
		});
	});

	onDestroy(() => {
		if (navigatingUnsubscriber) {
			navigatingUnsubscriber();
		}
	});

	let delayedChecked = $state(checked);

	$effect.pre(() => {
		if (!checked) {
			setTimeout(() => {
				delayedChecked = checked;
			}, 500);
		} else {
			delayedChecked = checked;
		}
	});

	$effect.pre(() => {
		freezeScrollRune.set(checked);
	});
</script>

<div
	class="drawer min-h-screen-new w-full {mobile ? 'drawer-mobile' : ''} {right
		? 'drawer-end '
		: ''}"
>
	<input id={drawerId} type="checkbox" class="drawer-toggle" bind:checked />
	<div class="drawer-content w-full overflow-x-hidden z-0">
		{@render mainChild()}
	</div>
	<div class="drawer-side overflow-hidden h-full !max-h-screen-new z-10">
		<label
			class="h-full drawer-overlay {backdropScreen
				? 'h-screen w-screen block fixed top-0 '
				: ''} {backdropClass}"
			for={drawerId}
		></label>
		<ul
			class="menu p-4 w-3/4 xs:max-w-[45%] sm:max-w-[50%] md:max-w-[45%] lg:max-w-[35%] xl:max-w-[29%] h-full flex flex-col flex-nowrap {delayedChecked
				? ''
				: 'hidden'} {drawerClass}"
		>
			<div class="flex justify-end w-full {closeBtn ? '' : 'hidden'}">
				<label for={drawerId} class="drawer-overlay">
					<div class="i-mdi-close-circle btn hover:scale-125"></div>
				</label>
			</div>
			{@render drawerContentChild()}
		</ul>
	</div>
</div>

<style>
	.drawer-toggle:checked ~ .drawer-side > .drawer-overlay {
		background-color: #fff7;
	}
	.drawer-toggle:checked ~ .drawer-side > ul:not(.drawer-overlay) {
		box-shadow: 0px 4px 4px 5px #00000026;
	}
</style>
