/// <reference types="vite-plugin-pwa/client" />
/// <reference types="vite-plugin-pwa/info" />

declare const __DATE__: string;
declare const __RELOAD_SW__: boolean;

// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces
// and what to do when importing types

// src/app.d.ts
/// <reference types="lucia" />
declare global {
	namespace App {
		interface Locals {
			auth: import('lucia').AuthRequest;
			buildDate: string;
			periodicUpdates: boolean;
		}
	}
	namespace Lucia {
		type Auth = import('$api/clients/luciaClient.server').Auth;
		type DatabaseUserAttributes = {
			username: string;
			firstName: string;
			lastName: string;
			email: string;
			is_verified: boolean;
			is_admin: boolean;
		};
		type DatabaseSessionAttributes = object;
	}
}

// THIS IS IMPORTANT!!!
export {};
