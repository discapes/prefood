<script lang="ts">
	import type { PageData } from "./$types";
	export let data: PageData;

	import { PUBLIC_STRIPE_KEY } from "$env/static/public";
	import { getContext, onMount } from "svelte";
	import { fade } from "svelte/transition";
	import type { Unsubscriber, Writable } from "svelte/store";
	import Slider from "$lib/Slider.svelte";
	import { beforeNavigate } from "$app/navigation";
	import { loadStripe, type Stripe, type StripeElements, type StripePaymentElement } from "@stripe/stripe-js";

	const darkmode: Writable<boolean> = getContext("darkmode");

	let paymentElement: StripePaymentElement;
	let elements: StripeElements;
	let stripe: Stripe;
	let paymentIntentID: string;
	let unsubFromDarkmode: Unsubscriber;

	let buttonVisible = false;
	let buttonLoading = true;
	let euros = 1;

	onMount(async () => {
		stripe = (await loadStripe(PUBLIC_STRIPE_KEY, { apiVersion: "2022-08-01" }))!;
		if (!stripe) throw new Error("Couldn't load stripe!");
		stripe.retrievePaymentIntent(data.clientSecret).then((pi) => (paymentIntentID = pi.paymentIntent!.id));
		createElements(document.body.classList.contains("dark"));
	});

	beforeNavigate(() => {
		if (paymentElement) paymentElement.destroy();
		if (unsubFromDarkmode) unsubFromDarkmode();
	});

	async function updateAmount() {
		buttonLoading = true;
		const res = await fetch(location.href, {
			method: "POST",
			body: JSON.stringify({ paymentIntentID, euros }),
		});
		if (res.status == 200) buttonLoading = false;
	}

	function createElements(dark: boolean) {
		let n = 0;
		unsubFromDarkmode = darkmode.subscribe((dark) => {
			if (n++ > 0) createElements(dark);
		});

		if (paymentElement) paymentElement.destroy();
		buttonVisible = false;
		buttonLoading = true;

		const appearance = {
			theme: dark ? "night" : "stripe",
		} as const;
		elements = stripe.elements({ appearance, clientSecret: data.clientSecret });
		paymentElement = elements.create("payment");
		paymentElement.mount("#paymentElement");
		buttonVisible = true;
		paymentElement.on("ready", () => {
			paymentElement.focus();
			buttonLoading = false;
		});
	}

	async function pay() {
		buttonLoading = true;
		const { error } = await stripe.confirmPayment({
			elements,
			confirmParams: {
				// Make sure to change this to your payment completion page
				return_url: location.origin + "/result",
			},
		});

		// This point will only be reached if there is an immediate error when
		// confirming the payment. Otherwise, your customer will be redirected to
		// your `return_url`. For some payment methods like iDEAL, your customer will
		// be redirected to an intermediate site first to authorize the payment, then
		// redirected to the `return_url`.
		if (error.type === "card_error" || error.type === "validation_error") {
			buttonLoading = false;
		} else {
			console.error(error);
			buttonLoading = false;
		}
	}
</script>

<svelte:head>
	<title>About</title>
	<meta name="description" content="About this app" />
</svelte:head>

<div class="flex flex-col justify-center items-center grow">
	<div>
		{#if buttonVisible}
			<div in:fade={{ duration: 1000 }} class="my-8 flex items-center">
				<Slider on:dragend={updateAmount} bind:value={euros} min={1} max={50} />
				<div class="cont w-16 ml-5 text-right">{euros} €</div>
			</div>
		{/if}
		<div id="paymentElement" class="mb-9 outline-none" />
		{#if buttonVisible}
			<button disabled={buttonLoading} in:fade={{ duration: 1000 }} on:click={pay} class="tracking-widest">
				{#if buttonLoading}
					<div class="m4mspinner" />
				{:else}
					<span>money 4 miika </span>
				{/if}
			</button>
		{/if}
	</div>
</div>

<style>
	@import "../../spinner.module.css";
	button {
		background: #5469d4;
		font-family: Arial, sans-serif;
		color: #ffffff;
		border-radius: 4px;
		border: 0;
		padding: 12px 16px;
		font-size: 16px;
		font-weight: 600;
		cursor: pointer;
		transition: all 0.2s ease;
		box-shadow: 0px 4px 5.5px 0px rgba(0, 0, 0, 0.07);
		width: 100%;
		height: 50px;
	}

	button:hover {
		filter: contrast(115%);
	}

	button:disabled {
		opacity: 0.8;
		cursor: default;
	}
</style>
