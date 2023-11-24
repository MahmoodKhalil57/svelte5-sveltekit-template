import type { APITypeB } from '$lib/apiUtils/server/ApiUtils.type.server';
import { responseStatus, getResponse } from '$lib/apiUtils/server/apiUtils.server';

export default {
	testPost: async ({ ctx, input }) => {
		ctx.status = responseStatus.INTERNAL_SERVER_ERROR;

		try {
			ctx.cookies.set('name', 'test', {
				path: '/'
			});
			ctx.status = responseStatus.SUCCESS;
		} catch (e) {
			console.log(e);
		}

		return getResponse(ctx.status, {
			[responseStatus.INTERNAL_SERVER_ERROR]: {
				message: ''
			},
			[responseStatus.SUCCESS]: {
				data: { name: input.name }
			}
		});
	},
	testGet: async ({ ctx, input }) => {
		ctx.status = responseStatus.INTERNAL_SERVER_ERROR;

		try {
			ctx.cookies.set('name', 'test', {
				path: '/'
			});
			ctx.status = responseStatus.SUCCESS;
		} catch (e) {
			console.log(e);
		}

		return getResponse(ctx.status, {
			[responseStatus.INTERNAL_SERVER_ERROR]: {
				message: ''
			},
			[responseStatus.SUCCESS]: {
				data: { name: input.name }
			}
		});
	}
} satisfies APITypeB<'testRouter'>;
