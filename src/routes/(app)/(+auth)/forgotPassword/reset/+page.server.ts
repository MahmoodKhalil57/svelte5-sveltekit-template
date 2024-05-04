// +page.server.ts
import { prisma } from '$api/clients/prisma.server';
import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ url, parent }) => {
	await parent();

	// If code doesnt exist redirect user to refreshLogin
	const codeParam = url.searchParams.get('code');
	let codeId: string | undefined;
	if (codeParam) {
		const codeRow = await prisma.authToken.findUnique({
			where: {
				id: codeParam
			}
		});
		codeId = codeRow?.id;
	}
	if (!codeId) {
		redirect(307, `/refreshLogin`);
	}

	return { codeId };
};
