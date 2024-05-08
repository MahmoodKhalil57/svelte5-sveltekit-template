import type { ServerRuneHandle as ServerRuneHandle } from '$apiUtils/client/apiClientUtils';
import { serverTimeRune } from './testRune.svelte';

export const serverRuneHandle = {
	serverTime: {
		set: serverTimeRune.set
	}
} satisfies ServerRuneHandle;
