import type { ServerStoreHandle } from '$apiUtils/client/apiClientUtils';
import { serverTimeStore } from './testStore';
import { userAttributesStore } from './userStore';

export const serverStoreHandle = {
	serverTime: {
		set: serverTimeStore.set
	},
	userAttributes: {
		set: userAttributesStore.set
	}
} satisfies ServerStoreHandle;
