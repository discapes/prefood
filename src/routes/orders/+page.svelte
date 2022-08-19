<script lang="ts">
	import type { PageData } from "./$types";
	import Login from "$lib/Login.svelte";
	import type { Order, User } from "src/types/types";
	import { fly } from "svelte/transition";

	export let data: PageData;
	let userData: User | undefined = data.userData;
	let orders: Order[] | undefined = data.orders;
</script>

{#if !userData || !orders}
	<Login />
{:else}
	<div in:fly={{ duration: 200, y: 200 }}>
		<h1>Your orders here</h1>
		<ol>
			{#each orders as order}
				<li>
					{JSON.stringify(order)}
				</li>
			{/each}
		</ol>
	</div>
{/if}
