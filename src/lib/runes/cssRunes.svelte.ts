import { browser } from '$app/environment';

export const scrollYRune = $state<number | undefined>(undefined);

const makeFreezeScrollRune = () => {
	let freezeScroll = $state(false);

	const setFreezeScroll = (newState: boolean) => {
		if (browser) {
			if (newState) {
				document.body.classList.add('no-scroll');
			} else {
				document.body.classList.remove('no-scroll');
			}
		}
	};
	return {
		get value() {
			return freezeScroll;
		},
		set value(newState: typeof freezeScroll) {
			if (browser) {
				setFreezeScroll(newState);
				freezeScroll = newState;
			}
		},
		toggle: () => {
			if (browser) {
				freezeScroll = !freezeScroll;
				setFreezeScroll(freezeScroll);
			}
		}
	};
};

export const freezeScrollRune = makeFreezeScrollRune();
