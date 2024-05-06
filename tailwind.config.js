/** @type {import('tailwindcss').Config} */
export default {
	content: ['./src/**/*.{html,js,svelte,ts}'],
	darkMode: ['selector', '[data-theme="forest"]'],
	theme: {
		extend: {}
	},
	daisyui: {
		themes: ["light", "forest"],
		logs: false
	},
	plugins: [
		require('@tailwindcss/typography'),
		require('daisyui'),
		require('tailwind-icones-plugin')
	]
};
