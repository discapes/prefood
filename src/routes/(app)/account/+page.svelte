<script lang="ts">
	import { browser } from "$app/environment";
	import { enhance } from "$app/forms";
	import { invalidateAll } from "$app/navigation";
	import { page } from "$app/stores";
	import { PUBLIC_APP_NAME } from "$env/static/public";
	import { DEFAULTSCOPES, SCOPES, URLS } from "$lib/addresses";
	import pen from "$lib/assets/pen.png";
	import upload from "$lib/assets/upload.png";
	import GithubButton from "$lib/components/GithubButton.svelte";
	import GoogleButton from "$lib/components/GoogleButton.svelte";
	import Login from "$lib/components/Login.svelte";
	import type { Account, ApiKey } from "$lib/services/Account";
	import { LinkParameters } from "$lib/types";
	import { formFrom, getDataURL, getEncoder } from "$lib/util";
	import type { ActionResult } from "@sveltejs/kit";
	import { getContext } from "svelte";
	import type { Writable } from "svelte/store";
	import { v4 as uuid } from "uuid";
	import eye from "$lib/assets/eye.svg";
	import type { ActionData } from "./$types";

	export let form: ActionData;
	let userData: Account;
	$: userData = $page.data.userData;
	const stateToken: Writable<string> = getContext("stateToken");
	let pictureDataURL = "";

	let imgUpload: HTMLInputElement;
	let editMode = false;

	let params: Omit<LinkParameters, "method">;
	$: params = {
		referer: $page.url.pathname,
		stateToken: $stateToken,
	};

	async function changeEmail() {
		const email = prompt("New email?");
		if (!email) return;
		const res = await fetch($page.url, {
			method: "POST",
			body: formFrom({
				email,
				passState: getEncoder(LinkParameters).encode({ ...params, method: "email" }),
			}),
		}).then((res) => res.json());
		console.log(res);
	}

	$: {
		if (browser && form?.message) {
			editMode = false;
			setTimeout(() => alert(form?.message), 0);
		}
	}
	function editResult({ result }: { result: ActionResult }) {
		invalidateAll();
	}
	let scopeModal = false;
	let editingKey: ApiKey | undefined;
	let scopes: Record<string, boolean> = { ...DEFAULTSCOPES };
	let showKeys = false;
	function addApiKey() {
		if (!userData.apiKeys) userData.apiKeys = [];
		if (!editingKey) {
			userData.apiKeys = [...userData.apiKeys, { key: uuid(), scopes: trueValues(scopes) }];
		} else {
			editingKey.scopes = trueValues(scopes);
		}

		scopeModal = false;

		function trueValues(rec: Record<string, boolean>) {
			return new Set([...Object.entries(rec)].flatMap(([k, v]) => (v ? [k] : [])));
		}
	}
	function editKey(key?: ApiKey) {
		if (!key) {
			editingKey = undefined;
			scopes = { ...DEFAULTSCOPES };
		} else {
			editingKey = key;
			scopes = Object.fromEntries([...key.scopes.keys()].map((k) => [k, true]));
		}
		scopeModal = true;
	}
</script>

<svelte:head>
	<title>Account - {PUBLIC_APP_NAME}</title>
</svelte:head>
{#if !userData}
	<Login />
{:else}
	<div class="flex flex-col gap-3 items-center m-10">
		<input
			type="file"
			on:change={async () => (pictureDataURL = await getDataURL(imgUpload?.files?.[0]))}
			bind:this={imgUpload}
			form="editform"
			name="picture"
			class="hidden"
		/>
		<div
			id={editMode ? "pcont" : ""}
			on:click={() => editMode && imgUpload.click()}
			class:cursor-pointer={editMode}
			class="relative grid place-items-center mb-2 h-40 w-40 rounded-full border-8 border-white overflow-hidden dark:border-neutral-700"
		>
			<img id="poverlay" alt="upload" class="" src={upload} />
			<div id="poverlay2" alt="" class="invert dark:invert-0 bg-black/30" />
			<img
				alt="profile"
				class="object-cover w-full h-full"
				src={pictureDataURL || userData.picture}
			/>
		</div>

		<!-- <div class="text-center rounded bg-yellow-100 border-2 p-1 border-yellow-500">
			RESPONSERESPONSE RESPONSERESPONSE RESPONSERESPONSE RESPONSERESPONSE
		</div> -->
		<div class="grid grid-cols-[auto_auto] gap-x-3">
			<h2 class="text-right">Name:</h2>
			{#if !editMode}
				<div>
					<h2 class="text-left font-bold inline">{userData.name}</h2>
					<img
						on:click={() => (editMode = true)}
						class="dark:invert cursor-pointer h-6 w-6 inline align-baseline ml-3"
						src={pen}
					/>
				</div>
			{:else}
				<input
					form="editform"
					name="name"
					class="h-full text-2xl bg-transparent border-b font-bold text-left w-80"
					value={userData.name}
				/>
			{/if}
			<h2 class="text-right">Bio:</h2>
			{#if !editMode}
				<div>
					<h2 class="text-left font-bold inline">{userData.bio ?? ""}</h2>
					<img
						on:click={() => (editMode = true)}
						class="dark:invert cursor-pointer h-6 w-6 inline align-baseline ml-3"
						src={pen}
					/>
				</div>
			{:else}
				<input
					form="editform"
					name="bio"
					class="h-full text-2xl bg-transparent border-b font-bold text-left w-80"
					value={userData.bio ?? ""}
				/>
			{/if}
			<h2 class="text-right">Email:</h2>
			<h2 class="font-bold text-left">{userData.email}</h2>
			{#if editMode}
				<div />
				<form
					class="contents"
					id="editform"
					use:enhance={editResult}
					method="POST"
					action="?/editprofile"
				>
					<button type="submit" class="cont w-60 mt-3" form="editform">Save</button>
				</form>
			{/if}
		</div>

		<h2>Identification methods</h2>
		<div class="grid grid-cols-2 gap-y-2 gap-x-6">
			<div class="bg-lime-300/50 rounded px-1 w-full h-full flex items-center">
				<span class="text-xl">Email</span>
			</div>
			<button on:click={changeEmail} class="cont w-full h-full">Change</button>
			<div
				class="{userData.githubID
					? 'bg-lime-300/50'
					: 'bg-rose-300/50'} rounded px-1 w-full h-full flex items-center"
			>
				<span class="text-xl">Github</span>
			</div>
			{#if userData.githubID}
				<form method="POST" use:enhance action="?/unlink">
					<button type="submit" name="method" value="githubID" class="cont w-full h-full"
						>Unlink</button
					>
				</form>
			{:else}
				<GithubButton
					text="Link Github"
					redirect_uri={`${$page.url.origin}${URLS.LINK}`}
					passState={getEncoder(LinkParameters).encode({ ...params, method: "githubID" })}
				/>
			{/if}
			<div
				class="{userData.googleID
					? 'bg-lime-300/50'
					: 'bg-rose-300/50'} rounded px-1 w-full h-full flex items-center"
			>
				<span class="text-xl">Google</span>
			</div>
			{#if userData.googleID}
				<form method="POST" use:enhance action="?/unlink">
					<button type="submit" name="method" value="googleID" class="cont w-full h-full"
						>Unlink</button
					>
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
		<div class="h-10" />
		<h2>API keys</h2>
		{#if userData.apiKeys}
			{#each userData.apiKeys as key}
				<div>
					<img
						on:click={() => (showKeys = !showKeys)}
						class="dark:invert cursor-pointer h-6 w-6 inline align-baseline mr-3"
						src={eye}
					/>
					{#if showKeys}
						<span>{key.key}</span>
					{:else}
						<span>{"~ ".repeat(key.key.length / 2)}</span>
					{/if}
					<img
						on:click={() => editKey(key)}
						class="dark:invert cursor-pointer h-6 w-6 inline align-baseline ml-3"
						src={pen}
					/>
				</div>
			{/each}
		{/if}
		<button class="cont" on:click={() => editKey()}>Add</button>
		<div class:flex={scopeModal} class="modal items-center justify-center">
			<div class="bg-white relative p-5 flex flex-col gap-5 items-start">
				<button
					on:click={() => (scopeModal = false)}
					class="absolute right-5 top-5 text-2xl leading-[15px]">&times;</button
				>
				<div
					class="inline-grid grid-cols-[auto_auto_auto] gap-3 gap-x-5 justify-items-center items-center"
				>
					<span>Read</span>
					<span>Write</span>
					<span>Field</span>
					{#each Object.entries(SCOPES.fields) as [field, types]}
						{#if types.read}
							<input
								bind:checked={scopes[field + ":read"]}
								type="checkbox"
								disabled={types.forced}
								class="rounded-full w-8 h-8"
								class:bg-neutral-300={!types.forced}
								class:bg-transparent={types.forced}
							/>
						{:else}&nbsp;{/if}
						{#if types.write}
							<input
								type="checkbox"
								bind:checked={scopes[field + ":write"]}
								class="bg-neutral-300 rounded-full w-8 h-8"
							/>
						{:else}&nbsp;{/if}
						<div class="w-full">{field}</div>
					{/each}
				</div>
				Actions
				<div
					class="grid grid-cols-[auto_auto] gap-3 gap-x-5 justify-items-center items-center"
				>
					{#each Object.entries(SCOPES.actions) as [action, name]}
						<input
							type="checkbox"
							bind:checked={scopes[action]}
							class="bg-neutral-300 rounded-full w-8 h-8"
						/>
						<div class="w-full">{name}</div>
					{/each}
				</div>
				<button class="cont" on:click={addApiKey}>Add key</button>
			</div>
		</div>
	</div>
{/if}

<style>
	h1,
	h2,
	h3 {
		margin: 0;
	}
	#pcont:hover #poverlay,
	#pcont:hover #poverlay2 {
		opacity: 1;
	}
	#poverlay,
	#poverlay2 {
		position: absolute;
		opacity: 0;
		transition: 0.5s ease;
	}
	#poverlay2 {
		height: 100%;
		width: 100%;
	}
	#poverlay {
		height: 50%;
		width: 50%;
		z-index: 10;
		filter: invert(1);
	}
</style>
