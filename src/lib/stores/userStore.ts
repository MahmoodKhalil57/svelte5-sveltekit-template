import { writable } from 'svelte/store';
import type { User } from 'lucia';

export const userAttributesStore = writable<User | null>();
