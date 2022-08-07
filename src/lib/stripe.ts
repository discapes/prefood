import { STRIPE_SECRET_KEY } from '$env/static/private';
import { PUBLIC_STRIPE_KEY } from '$env/static/public';
import Stripe from 'stripe';

export function getSecretStripe(): Stripe {
	return new Stripe(STRIPE_SECRET_KEY, {
		apiVersion: '2022-08-01'
	});
}

export function getPublicStripe(): Stripe {
	return new Stripe(PUBLIC_STRIPE_KEY, {
		apiVersion: '2022-08-01'
	});
}
