import vercelAdapter from '@sveltejs/adapter-vercel';
import staticAdapter from '@sveltejs/adapter-static';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';
import path from 'path';

/** @type {import('@sveltejs/adapter-static') | import('@sveltejs/adapter-vercel')} */
const adapter = process.env.VERCEL ? vercelAdapter : staticAdapter;

/** @type {import('@sveltejs/kit').Config} */
const config = {
	// Consult https://kit.svelte.dev/docs/integrations#preprocessors
	// for more information about preprocessors
	preprocess: vitePreprocess(),

	vite: {
		build: {
			sourcemap: true
		}
	},
	kit: {
		alias: {
			$e: path.resolve('./src/env.server.ts'),
			$api: path.resolve('./src/server'),
			$src: path.resolve('./src'),
			$apiUtils: path.resolve('./src/lib/utils/apiUtils')
		},
		adapter: adapter({
			// default options are shown. On some platforms
			// these options are set automatically — see below
			pages: 'build',
			assets: 'build',
			fallback: 'index.html',
			precompress: true,
			strict: true,
			prerender: false
		})
	},
	vitePlugin: {
		inspector: true
	}
};

export default config;
