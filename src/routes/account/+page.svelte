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

	let imgUpload: HTMLInputElement;
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
		<input type="file" bind:this={imgUpload} class="hidden" />
		<img
			on:click={() => editMode && imgUpload.click()}
			alt="profile"
			class:cursor-pointer={editMode}
			class="object-cover h-40 w-40 rounded-full border-8 border-white dark:border-neutral-700	"
			src={userData.picture}
		/>

		<div class="grid grid-cols-[auto_auto] gap-x-3">
			<h2 class="text-right">Name:</h2>
			{#if !editMode}
				<div>
					<h2 class="text-left font-bold inline">{userData.name}</h2>
					<img on:click={() => (editMode = true)} class="dark:invert cursor-pointer h-6 w-6 inline align-baseline ml-3" src={pen} />
				</div>
			{:else}
				<input form="editform" name="name" class="h-full text-2xl bg-transparent border-b font-bold text-left w-80" value={userData.name} />
			{/if}
			<h2 class="text-right">Bio:</h2>
			{#if !editMode}
				<div>
					<h2 class="text-left font-bold inline">{userData.bio ?? ""}</h2>
					<img on:click={() => (editMode = true)} class="dark:invert cursor-pointer h-6 w-6 inline align-baseline ml-3" src={pen} />
				</div>
			{:else}
				<input form="editform" name="email" class="h-full text-2xl bg-transparent border-b font-bold text-left w-80" value={userData.bio ?? ""} />
			{/if}
			<h2 class="text-right">Email:</h2>
			<h2 class="font-bold text-left">{userData.email}</h2>
			{#if editMode}
				<div />
				<form class="contents" id="editform" use:enhance={enhanceProps} method="POST" action="?/editprofile">
					<button type="submit" class="cont w-60 mt-3" form="editform">Save</button>
				</form>
			{/if}
		</div>

		<h2>Identification methods</h2>
		<div class="grid grid-cols-2 gap-y-2 gap-x-6">
			<div class="bg-lime-300/50 rounded px-1 w-full h-full flex items-center">
				<span class="text-xl">Email</span>
			</div>
			<button class="cont w-full h-full">Change</button>
			<div class="{userData.githubID ? 'bg-lime-300/50' : ''} rounded px-1 w-full h-full flex items-center">
				<span class="text-xl">Github</span>
			</div>
			{#if userData.githubID}
				<form method="POST" use:enhance={enhanceProps} action="?/unlink">
					<button type="submit" name="method" value="githubID" class="cont w-full h-full">Unlink</button>
				</form>
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
				<form method="POST" use:enhance={enhanceProps} action="?/unlink">
					<button type="submit" name="method" value="googleID" class="cont w-full h-full">Unlink</button>
				</form>
			{:else}
				<GoogleButton
					text="Link Google"
					redirect_uri={`${$page.url.origin}${URLS.LINK}`}
					passState={getEncoder(LinkParameters).encode({ ...params, method: "googleID" })}
				/>
			{/if}
		</div>
		<div class="h-10" />
		<form method="POST" class="contents">
			<button formaction="?/revoke" type="submit" class="cont w-60">Revoke logins</button>
			<button formaction="?/logout" type="submit" class="cont w-60">Sign out</button>
		</form>
		<form method="POST" on:submit={() => confirm("Delete account")} action="?/deleteaccount">
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
