import type { ServerRuneHandle } from '$apiUtils/client/apiClientUtils';
import { serverTimeRune } from './testRune.svelte';
import { userAttributesRune } from './userRune.svelte';

export const serverRuneHandle = {
	serverTime: {
		set: (newValue: typeof serverTimeRune.value) => (serverTimeRune.value = newValue)
	},
	userAttributes: {
		set: (newValue: typeof userAttributesRune.value) => (userAttributesRune.value = newValue)
	}
} satisfies ServerRuneHandle;
