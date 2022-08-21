<script lang="ts">
	import type { PageData } from "./$types";
	import Login from "$lib/Login.svelte";
	import type { User } from "src/types/types";
	import GithubButton from "$lib/GithubButton.svelte";
	import GoogleButton from "$lib/GoogleButton.svelte";

	export let data: PageData;
	let userData: User | undefined = data.userData;

	async function signOut() {
		await fetch("/account/logout", { method: "POST" });
		document.cookie = "sessionID=; Max-Age=0;";
		document.cookie = "userID=; Max-Age=0;";
		location.reload();
	}

	const identMethods = userData
		? Object.entries({ Google: userData.googleID, Github: userData.githubID, email: userData.email })
				.flatMap(([k, v]) => (v ? [k] : []))
				.join(", ")
		: undefined;
</script>

{#if !userData}
	<Login />
{:else}
	<div class="flex flex-col gap-3 items-center m-10">
		<img alt="profile" class="object-cover h-40 w-40 rounded-full border-8 border-white dark:border-neutral-700	" src={userData.picture} />

		<div class="hidden sm:flex">
			<div class="flex flex-col ml-4 mr-20">
				<h2 class="mb-0">Name:</h2>
				<h2 class="m-0">Email:</h2>
				<h2 class="mt-0">Identification methods:</h2>
			</div>
			<div class="flex flex-col">
				<h2 class="mb-0 text-left font-bold">{userData.name}</h2>
				<h2 class="m-0 text-left font-bold">{userData.email}</h2>
				<h2 class="mt-0 text-left font-bold">{identMethods}</h2>
			</div>
		</div>
		<div class="flex flex-col items-center sm:hidden">
			<h2 class="mb-0">Name:</h2>
			<h2 class="my-0 text-left font-bold">{userData.name}</h2>
			<h2 class="mb-0">Email:</h2>
			<h2 class="mt-0 text-left font-bold">{userData.email}</h2>
			<h2 class="mb-0">Identification methods:</h2>
			<h2 class="mt-0 text-left font-bold">{identMethods}</h2>
		</div>
		{#if !userData.githubID}
			<GithubButton opts={{}} />
		{/if}
		{#if !userData.googleID}
			<GoogleButton opts={{}} />
		{/if}
		<button class="cont w-60" on:click={signOut}>Sign out</button>
	</div>
{/if}
