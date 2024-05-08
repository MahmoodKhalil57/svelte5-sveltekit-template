const makeServerTimeRune = () => {
	let serverTimeRune = $state<number | undefined>(undefined);
	return {
		get value() {
			return serverTimeRune;
		},
		set value(newState: typeof serverTimeRune) {
			serverTimeRune = newState;
		}
	};
};

export const serverTimeRune = makeServerTimeRune();
