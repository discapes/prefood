<script lang="ts">
	import Login from '$lib/Login.svelte';
	import type { User } from 'src/types/types';
	import { fly } from 'svelte/transition';

	export let userData: User;
	let width: number = 0;

	async function signOut() {
		await fetch('/account/logout', { method: 'POST' });
		document.cookie = 'sessionID=; Max-Age=0;';
		document.cookie = 'userID=; Max-Age=0;';
		location.reload();
	}
</script>

<svelte:window bind:innerWidth={width} />

{#if !userData}
	<Login />
{:else}
	<div class="flex flex-col gap-3 items-center m-10">
		<img alt="profile" class="object-cover h-40 w-40 rounded-full border-8 border-white dark:border-neutral-700	" src={userData.picture} />

		{#if width >= 640}
			<div in:fly={{ duration: 200, y: 200 }} class="flex items-center">
				<div class="flex flex-col ml-4 mr-20">
					<h2 class="mb-0">Name:</h2>
					<h2 class="mt-0">Email:</h2>
				</div>
				<div class="flex flex-col">
					<h2 class="mb-0 text-left font-bold">{userData.name}</h2>
					<h2 class="mt-0 text-left font-bold">{userData.email}</h2>
				</div>
			</div>
		{:else}
			<div in:fly={{ duration: 200, y: 200 }} class="flex flex-col items-center">
				<h2 class="mb-0">Name:</h2>
				<h2 class="my-0 text-left font-bold">{userData.name}</h2>
				<h2 class="mb-0">Email:</h2>
				<h2 class="mt-0 text-left font-bold">{userData.email}</h2>
			</div>
		{/if}
		<button class="cont w-60" on:click={signOut}>Sign out</button>
	</div>
{/if}
