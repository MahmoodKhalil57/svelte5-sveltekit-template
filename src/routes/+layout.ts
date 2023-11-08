import { browser } from '$app/environment';

export const load = async () => {
	if (browser) {
		const dark = 'dark';
		const light = 'light';
		const isDark = window.localStorage.getItem('theme')
			? window.localStorage.getItem('theme') === dark
			: window.matchMedia('(prefers-color-scheme: dark)').matches;

		if (isDark) {
			window.localStorage.setItem('theme', dark);
			window.document.documentElement.setAttribute('data-theme', dark);
		} else {
			window.localStorage.setItem('theme', light);
			window.document.documentElement.setAttribute('data-theme', light);
		}
	}
};
