import type { PageLoad } from './$types';
import { updateSessionUserStore } from '$lib/stores/userStore';
import { redirect } from '@sveltejs/kit';

export const load: PageLoad = async ({ data }) => {
	updateSessionUserStore(data.user ?? null);
	redirect(307, '/?');
};
