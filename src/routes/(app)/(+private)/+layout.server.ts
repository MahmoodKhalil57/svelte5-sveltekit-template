// +page.server.ts
import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ parent }) => {
	const { userAttributes } = await parent();
	if (!userAttributes?.id) {
		// if logged in, redirect to home page
		redirect(302, '/');
	}
};
