import toast from 'svelte-french-toast';
import { dev } from '$app/environment';

export const toastWrapper = (devOnly = true) => {
	if (!devOnly || dev) {
		return toast;
	} else {
		return {
			promise: async <P>(callback: Promise<P>) => await callback,
			error: () => {},
			success: () => {}
		};
	}
};
