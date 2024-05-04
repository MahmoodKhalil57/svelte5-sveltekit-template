import type { ServerStoreHandle } from '$apiUtils/client/apiClientUtils';
import { serverTimeStore } from './testStore';

export const serverStoreHandle = {
	serverTime: {
		set: async (value: number) => {
			serverTimeStore.set(value);
		}
	}
} satisfies ServerStoreHandle;
