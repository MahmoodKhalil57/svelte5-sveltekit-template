// +page.server.ts
import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { validatAuthUserToken } from '$api/controllers/authController.server';

export const load: PageServerLoad = async ({ url }) => {
	const codeParam = url.searchParams.get('code');
	let codeId: string | undefined;
	if (codeParam) {
		const codeRow = await validatAuthUserToken(codeParam);
		codeId = codeRow?.id;
	}
	if (!codeId) {
		redirect(302, '/verify');
	}

	return { codeId };
};
