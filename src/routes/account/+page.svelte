<script lang="ts">
	import { goto } from "$app/navigation";
	import { page } from "$app/stores";
	import GithubButton from "$lib/components/GithubButton.svelte";
	import GoogleButton from "$lib/components/GoogleButton.svelte";
	import Login from "$lib/components/Login.svelte";
	import { LinkParameters } from "$lib/types";
	import { getEncoder } from "$lib/util";
	import { enhance } from "@sveltejs/kit";
	import { getContext } from "svelte";
	import type { Writable } from "svelte/store";
	import type { FormData, PageData } from "./$types";
	import pen from "$lib/assets/pen.png";
	import { URLS } from "$lib/addresses";

	export let data: PageData;
	export let form: FormData;
	const stateToken: Writable<string> = getContext("stateToken");
	const { userData } = data;

	let editMode = false;

	let params: Omit<LinkParameters, "method">;
	$: params = {
		referer: $page.url.pathname,
		stateToken: $stateToken,
	};
	const enhanceProps: Parameters<typeof enhance>[1] = {
		redirect: ({ location }) => goto(location),
		result: ({ response }) => (form = <any>response),
		invalid: ({ response }) => (form = <any>response),
	};
</script>

{#if !userData}
	<Login />
{:else}
	<div class="flex flex-col gap-3 items-center m-10">
		<img alt="profile" class="object-cover h-40 w-40 rounded-full border-8 border-white dark:border-neutral-700	" src={userData.picture} />

		<div class="hidden sm:flex">
			<div class="flex flex-col ml-4 mr-20">
				<h2>Name:</h2>
				<h2>Email:</h2>
			</div>
			<div class="flex flex-col">
				{#if !editMode}
					<div>
						<h2 class="text-left font-bold inline">{userData.name}</h2>
						<img on:click={() => (editMode = true)} class="cursor-pointer h-6 w-6 inline align-baseline ml-3" src={pen} />
					</div>
					<div>
						<h2 class="text-left font-bold inline">{userData.email}</h2>
						<img on:click={() => (editMode = true)} class="cursor-pointer h-6 w-6 inline align-baseline ml-3" src={pen} />
					</div>
				{:else}
					<form class="contents" id="editform" use:enhance={enhanceProps} method="POST" action="?/editprofile">
						<input name="name" class="h-full text-2xl bg-transparent border-b font-bold text-left w-80" value={userData.name} />
						<input name="email" class="h-full text-2xl bg-transparent border-b font-bold text-left w-80" value={userData.email} />
						<button type="submit" class="cont w-60 mt-5" form="editform">Save</button>
					</form>
				{/if}
			</div>
		</div>
		<div class="flex flex-col items-center sm:hidden">
			<h2 class="mb-0">Name:</h2>
			<h2 class="my-0 text-left font-bold">{userData.name}</h2>
			<h2 class="mb-0">Email:</h2>
			<h2 class="mt-0 text-left font-bold">{userData.email}</h2>
		</div>

		<h2>Identification methods</h2>
		<div class="grid grid-cols-2 gap-5">
			<div class="bg-lime-300/50 rounded px-1 w-full h-full flex items-center">
				<span class="text-xl">Email</span>
			</div>
			<button class="cont w-full h-full">Change</button>
			<div class="{userData.githubID ? 'bg-lime-300/50' : ''} rounded px-1 w-full h-full flex items-center">
				<span class="text-xl">Github</span>
			</div>
			{#if userData.githubID}
				<button class="cont w-full h-full">Unlink</button>
			{:else}
				<GithubButton
					text="Link Github"
					redirect_uri={`${$page.url.origin}${URLS.LINK}`}
					passState={getEncoder(LinkParameters).encode({ ...params, method: "githubID" })}
				/>
			{/if}
			<div class="{userData.googleID ? 'bg-lime-300/50' : ''} rounded px-1 w-full h-full flex items-center">
				<span class="text-xl">Google</span>
			</div>
			{#if userData.googleID}
				<button class="cont w-full h-full">Unlink</button>
			{:else}
				<GoogleButton
					text="Link Google"
					redirect_uri={`${$page.url.origin}${URLS.LINK}`}
					passState={getEncoder(LinkParameters).encode({ ...params, method: "googleID" })}
				/>
			{/if}
		</div>
		<div class="h-10" />
		<form use:enhance={enhanceProps} method="POST" action="?/logout">
			<button type="submit" class="cont w-60">Sign out</button>
		</form>
		<form use:enhance={enhanceProps} method="POST" on:submit={() => confirm("Delete account")} action="?/deleteaccount">
			<button type="submit" class="cont w-60">Delete account</button>
		</form>
	</div>
{/if}

<style>
	h1,
	h2,
	h3 {
		margin: 0;
	}
</style>
