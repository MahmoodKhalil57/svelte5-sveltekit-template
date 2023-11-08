import type { API } from '$api/root.server';
import { handlerBuilder, type ProxyDataType } from '$lib/apiUtils/client/apiClientUtils';

export const apiSend = (f?: typeof fetch) =>
	new Proxy({}, handlerBuilder(f)) as ProxyDataType<typeof API, undefined>;
