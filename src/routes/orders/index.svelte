<script lang="ts">
	import Login from '$lib/Login.svelte';
	import type { Order, User } from 'src/types/types';
	import { fly } from 'svelte/transition';

	export let userData: User;
	export let orders: Order[];
</script>

{#if !userData}
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
