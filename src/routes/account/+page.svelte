<script lang="ts">
	import type { PageData } from "./$types";
	import Login from "$lib/components/Login.svelte";
	import { v4 as uuidv4 } from "uuid";
	import { onMount } from "svelte";
	import type { LinkParameters } from "./link/+server";
	import { page } from "$app/stores";

	export let data: PageData;
	const { userData } = data;

	const identMethods = userData
		? Object.entries({ Google: userData.googleID, Github: userData.githubID, email: userData.email })
				.flatMap(([k, v]) => (v ? [k] : []))
				.join(", ")
		: undefined;

	// const stateToken = uuidv4();
	// onMount(() => {
	// 	document.cookie = `state=${stateToken}`;
	// });

	// let params: Omit<LinkParameters, "method">;
	// $: params = {
	// 	referer: $page.url.pathname,
	// 	stateToken,
	// };
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

		<form method="POST" action="?/logout">
			<button class="cont w-60">Sign out</button>
		</form>
		<form method="POST" action="?/editprofile">
			<button class="cont w-60">editprofile</button>
		</form>
		<div class="flex gap-5">
			{#if !userData.githubID}
				<!-- <GithubButton text="Link Github" opts={{ referer: $page.url.pathname }} /> -->
			{/if}
			{#if !userData.googleID}
				<!-- <GoogleButton text="Link Google" opts={{ referer: $page.url.pathname }} /> -->
			{/if}
		</div>
	</div>
{/if}
