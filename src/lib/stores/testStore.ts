import { writable } from 'svelte/store';

export let serverTimeStore = writable<number | undefined>(undefined);
