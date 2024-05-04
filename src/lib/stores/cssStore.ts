import { writable } from 'svelte/store';
import { browser } from '$app/environment';

// const getFreeStore = () => {
//     return {
//         get: freezeScroll,
//         set: toggleScrolling
//     }
// }

export const freezeScroll = writable(false);

function upsertScrollStore() {
	// const store = writable({a: 0, b: 0});
	return {
		subscribe: freezeScroll.subscribe,
		set: (newState: boolean) => {
			if (browser) {
				if (newState) {
					document.body.classList.add('no-scroll');
				} else {
					document.body.classList.remove('no-scroll');
				}
				freezeScroll.set(newState);
				// set(newState); // I would expect `state` to be unchanged without this
			}
		}
	};
}

export const scrollStore = upsertScrollStore();

export const toggleScrolling = (setValue?: boolean) => {
	freezeScroll.update((val) => {
		if (setValue !== undefined) {
			val = setValue;
		} else {
			val = !val;
		}

		if (val) {
			document.body.classList.add('no-scroll');
		} else {
			document.body.classList.remove('no-scroll');
		}
		return val;
	});
};
