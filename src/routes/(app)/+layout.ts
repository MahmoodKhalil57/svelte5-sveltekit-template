import { serverRuneHandle } from '$lib/runes/serverRuneHandle.svelte';
import type { LayoutLoad } from './$types';

export const load: LayoutLoad = async ({ data }) => {
	serverRuneHandle.userAttributes.set(data?.userAttributes ?? null);
};
