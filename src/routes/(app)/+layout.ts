import { updateSessionUserStore } from '$lib/stores/userStore';
import type { LayoutLoad } from './$types';

export const load: LayoutLoad = async ({ data }) => {
	updateSessionUserStore(data?.user ?? null);
};
