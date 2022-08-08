// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces
// and what to do when importing types

declare global {
	// const Stripe: stripe.Stripe;

	interface Window {
		onSignIn: (response: any) => void;
	}

	declare namespace App {
		interface Locals {
			sessionID?: string;
			userID?: string;
		}

		// interface Platform {}

		// interface PrivateEnv {}

		// interface PublicEnv {}

		// interface Session {}

		// interface Stuff {}
	}
}

export {};
