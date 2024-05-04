import { type APIType, responseStatus, getResponse } from '$api/root.server';

export default {
	testPost: async ({ ctx, input }) => {
		ctx.status = responseStatus.INTERNAL_SERVER_ERROR;

		try {
			ctx.cookies.set('name', 'test', {
				path: '/'
			});
			ctx.status = responseStatus.SUCCESS;
		} catch (e) {
			console.log('🚀 ~ testPost: ~ e:', e);
		}

		return getResponse(ctx.status, {
			[responseStatus.INTERNAL_SERVER_ERROR]: {
				message: ''
			},
			[responseStatus.SUCCESS]: {
				data: { name: input.name, message: 'Success' },
				stores: {
					serverTime: {
						set: new Date().getMilliseconds()
					}
				}
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
			console.log('🚀 ~ testGet: ~ e:', e);
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
} satisfies APIType['testRouter'];
