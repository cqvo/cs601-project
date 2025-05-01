// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
declare global {
	namespace App {
		// interface Error {}
		interface Locals {
			user: never;
			session: boolean;
			authValidated: never;
			hadExpiredSession: never;
		}
		// interface PageData {}
		// interface PageState {}
		// interface Platform {}
	}
}

export {};
