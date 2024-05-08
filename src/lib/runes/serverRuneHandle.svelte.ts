import type { ServerRuneHandle as ServerRuneHandle } from '$apiUtils/client/apiClientUtils';
import { serverTimeRune } from './testRune.svelte';
import { userAttributesRune } from './userRune.svelte';

export const serverRuneHandle = {
	serverTime: {
		set: serverTimeRune.set
	},
	userAttributes: {
		set: userAttributesRune.set
	}
} satisfies ServerRuneHandle;
