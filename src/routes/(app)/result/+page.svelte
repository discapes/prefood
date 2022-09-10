<script lang="ts">
	import Banner from "$lib/components/Banner.svelte";
	import { PUBLIC_APP_NAME, PUBLIC_STRIPE_KEY } from "$env/static/public";
	import { onMount } from "svelte";
	import { loadStripe } from "@stripe/stripe-js";

	let title: string = "...";
	let subtitle: string = "";

	onMount(async () => {
		const params = new URLSearchParams(window.location.search);

		const clientSecret = params.get("payment_intent_client_secret");
		if (!clientSecret) return { status: 400 };

		const stripe = await loadStripe(PUBLIC_STRIPE_KEY, { apiVersion: "2022-08-01" });
		if (!stripe) throw new Error("Couldn't load stripe!");
		const { paymentIntent } = await stripe.retrievePaymentIntent(clientSecret);
		if (!paymentIntent) throw new Error("Couldn't retrieve paymentintent");

		({ title, subtitle } = getMessage(paymentIntent.status));

		function getMessage(status: string) {
			switch (status) {
				case "succeeded":
					return { title: "SUCCESS", subtitle: "thankyouthankyouthankyou" };
				case "processing":
					return { title: "PROCESSING", subtitle: "pleasepleaseplease" };
				case "requires_payment_method":
					return { title: "CANCEL", subtitle: "didn't work, try again" };
				default:
					return { title: "ERROR", subtitle: "something went wrong" };
			}
		}
	});
</script>

<svelte:head>
	<title>{title} - {PUBLIC_APP_NAME}</title>
	<meta name="description" content={subtitle} />
</svelte:head>

<Banner {title} {subtitle} />
