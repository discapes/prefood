<script lang="ts">
	import { PUBLIC_APP_NAME } from "$env/static/public";
	import Login from "$lib/components/Login.svelte";
	import type { Account } from "$lib/types/Account";
	import type { Order } from "$lib/types/Order";
	import { getSlugFromOrder } from "$lib/util";
	import { fly } from "svelte/transition";
	import type { PageData } from "./$types";

	export let data: PageData;
	let userData: Account | undefined = data.userData;
	let orders: Order[] | undefined = data.orders;
</script>

<svelte:head>
	<title>Orders - {PUBLIC_APP_NAME}</title>
</svelte:head>
{#if !userData || !orders}
	<Login />
{:else}
	<div in:fly={{ duration: 200, y: 200 }}>
		<h1>Your orders</h1>
		<ol class="flex flex-col gap-5">
			{#each orders as order}
				<li>
					<a href="/orders/{getSlugFromOrder(order)}" class="nolink smallscale flex flex-wrap gap-8 bg-white/20 p-5 rounded dark:bg-white/10">
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
					</a>
				</li>
			{/each}
		</ol>
	</div>
{/if}

<style>
	h4,
	p {
		margin: 0;
	}
</style>
