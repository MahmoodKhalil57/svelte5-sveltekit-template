const makeServerTimeRune = () => {
	let serverTimeRune = $state<number | undefined>(undefined);

	const set = (newState: typeof serverTimeRune) => {
		serverTimeRune = newState;
	};
	return {
		get value() {
			return serverTimeRune;
		},
		set value(newState: typeof serverTimeRune) {
			set(newState);
		},
		set
	};
};

export const serverTimeRune = makeServerTimeRune();
