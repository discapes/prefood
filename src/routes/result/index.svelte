<script context="module">
	export const prerender = true;
</script>

<script lang="ts">
	import Banner from '$lib/Banner.svelte';
	import { PUBLIC_STRIPE_KEY } from '$env/static/public';
	import { onMount } from 'svelte';

	let title: string = '...';
	let subtitle: string = '';

	onMount(async () => {
		const params = new URLSearchParams(window.location.search);

		const clientSecret = params.get('payment_intent_client_secret');
		if (!clientSecret) return { status: 400 };

		const stripe = new globalThis.Stripe(PUBLIC_STRIPE_KEY, { apiVersion: '2022-08-01' });
		const { paymentIntent } = await stripe.retrievePaymentIntent(clientSecret);

		({ title, subtitle } = getMessage(paymentIntent.status));

		function getMessage(status: string) {
			switch (status) {
				case 'succeeded':
					return { title: 'SUCCESS', subtitle: 'thankyouthankyouthankyou' };
				case 'processing':
					return { title: 'PROCESSING', subtitle: 'pleasepleaseplease' };
				case 'requires_payment_method':
					return { title: 'CANCEL', subtitle: "didn't work, try again" };
				default:
					return { title: 'ERROR', subtitle: 'something went wrong' };
			}
		}
	});
</script>

<svelte:head>
	<title>{title}</title>
	<meta name="description" content={subtitle} />
	<script src="https://js.stripe.com/v3/"></script>
</svelte:head>

<Banner {title} {subtitle} />
