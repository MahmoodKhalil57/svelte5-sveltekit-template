import type { ServerStoreHandle } from '$apiUtils/client/apiClientUtils';
import { serverTimeStore } from './testStore';
import type { User } from 'lucia';
import { userAttributesStore } from './userStore';

export const serverStoreHandle = {
	serverTime: {
		set: async (value: number) => {
			serverTimeStore.set(value);
		}
	},
	userAttributes: {
		set: async (value: User | null) => {
			userAttributesStore.set(value);
		}
	}
} satisfies ServerStoreHandle;
