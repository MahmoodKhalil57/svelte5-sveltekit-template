import { serverStoreHandle } from '$lib/stores/serverStoreHandle';
import type { LayoutLoad } from './$types';

export const load: LayoutLoad = async ({ data }) => {
	serverStoreHandle.userAttributes.set(data?.userAttributes ?? null);
};
