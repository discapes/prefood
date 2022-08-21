<script lang="ts">
	import type { PageData } from "./$types";
	import Login from "$lib/Login.svelte";
	import type { Order, User } from "src/types/types";
	import { fly } from "svelte/transition";
	import { getSlugFromOrder } from "$lib/util";

	export let data: PageData;
	let userData: User | undefined = data.userData;
	let orders: Order[] | undefined = data.orders;
</script>

{#if !userData || !orders}
	<Login />
{:else}
	<div in:fly={{ duration: 200, y: 200 }}>
		<h1>Your orders</h1>
		<ol class="flex flex-col gap-5">
			{#each orders as order}
				<li>
					<a href="/orders/{getSlugFromOrder(order)}" class="nolink smallscale flex gap-8 bg-white/50 p-5 rounded dark:bg-white/10">
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
