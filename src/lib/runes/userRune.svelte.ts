import type { User } from 'lucia';

const makeUserAttributesRune = () => {
	let userAttributesRune = $state<User | null | undefined>(undefined);
	return {
		get value() {
			return userAttributesRune;
		},
		set value(newState: typeof userAttributesRune) {
			userAttributesRune = newState;
		}
	};
};

export const userAttributesRune = makeUserAttributesRune();
