// +page.server.ts
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals }) => {
	const user = (await locals.auth.validate())?.user;

	return { user };
};
