declare global {
	// const Stripe: stripe.Stripe;
	// put variables here to access them as globals

	interface Window {
		// put variables here to access them through .window
	}

	declare namespace App {
		// See https://kit.svelte.dev/docs/types#app
		// for information about these interfaces
		// and what to do when importing types

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
