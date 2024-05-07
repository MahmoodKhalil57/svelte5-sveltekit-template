import type { ServerStoreHandle } from '$apiUtils/client/apiClientUtils';
import { serverTimeStore } from './testStore';

export const serverStoreHandle = {
	serverTime: {
		set: serverTimeStore.set
	}
} satisfies ServerStoreHandle;
