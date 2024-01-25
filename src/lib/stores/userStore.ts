import { writable } from 'svelte/store';
import type { User } from 'lucia';

export const sessionUserStore = writable<User | null>();

export const updateSessionUserStore = (sessionUser: User | null) => {
	sessionUserStore.update(($sessionUserStore) => {
		$sessionUserStore = sessionUser;

		return $sessionUserStore;
	});
};
