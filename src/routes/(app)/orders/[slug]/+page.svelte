<script lang="ts">
	import { PUBLIC_APP_NAME } from "$env/static/public";
	import type { Order } from "$lib/types/Order";
	import { fly } from "svelte/transition";
	import type { PageData } from "./$types";

	export let data: PageData;
	const order: Order = data.order;
</script>

<svelte:head>
	<title>{order.restaurantName} order - {PUBLIC_APP_NAME}</title>
</svelte:head>

<section in:fly={{ duration: 200, y: 200 }}>
	<div class="flex gap-8 bg-white/50 p-5 rounded dark:bg-white/10">
		<div class="flex flex-col gap-3">
			<h4>Restaurant</h4>
			<p>
				{order.restaurantName}
			</p>
		</div>
		<div class="flex flex-col gap-3">
			<h4>Date</h4>
			<p>
				{new Date(order.timestamp).toLocaleTimeString()} on {new Date(order.timestamp).toLocaleDateString()}
			</p>
		</div>
		<div class="flex flex-col gap-3">
			<h4>Items</h4>
			<div class="flex flex-col gap-1">
				{#each order.items as item}
					<p>
						{item.quantity}x {item.description} - {(item.amount_total / 100).toFixed(2).replace(".", ",")}&nbsp;€
					</p>
				{/each}
			</div>
		</div>
	</div>
</section>

<style>
	@use "spinner.module.css";

	/* :global(pre) {
		background-color: rgba(150, 150, 150, 0.1);
		font-family: var(--font-mono);
		box-shadow: 2px 2px 6px #ffffff40;
	}

	:global(.dark) pre {
		background-color: rgba(255, 255, 255, 0.3);
	} */
</style>
