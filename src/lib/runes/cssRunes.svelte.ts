import { browser } from '$app/environment';

export const scrollYRune = $state<number | undefined>(undefined);

const makeFreezeScrollRune = () => {
	let freezeScroll = $state(false);

	const setFreezeScroll = (newState: typeof freezeScroll) => {
		if (browser) {
			if (newState) {
				document.body.classList.add('no-scroll');
			} else {
				document.body.classList.remove('no-scroll');
			}
		}
	};

	const set = (newState: typeof freezeScroll) => {
		setFreezeScroll(newState);
		freezeScroll = newState;
	};
	return {
		get value() {
			return freezeScroll;
		},
		set value(newState: typeof freezeScroll) {
			set(newState);
		},
		toggle: () => set(!freezeScroll)
	};
};

export const freezeScrollRune = makeFreezeScrollRune();
