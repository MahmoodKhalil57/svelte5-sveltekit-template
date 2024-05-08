import type { ServerRuneHandle } from '$apiUtils/client/apiClientUtils';
import { serverTimeRune } from './testRune.svelte';

export const serverRuneHandle = {
	serverTime: {
		set: (newValue: typeof serverTimeRune.value) => (serverTimeRune.value = newValue)
	}
} satisfies ServerRuneHandle;
