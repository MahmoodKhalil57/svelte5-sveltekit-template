import type { PageLoad } from './$types';
import { redirect } from '@sveltejs/kit';
import { serverStoreHandle } from '$lib/stores/serverStoreHandle';

export const load: PageLoad = async ({ data }) => {
	serverStoreHandle.userAttributes.set(data.user ?? null);
	redirect(307, '/?');
};
