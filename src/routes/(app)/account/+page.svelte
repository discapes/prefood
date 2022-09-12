<script lang="ts">
	import { browser } from "$app/environment";
	import { applyAction, enhance } from "$app/forms";
	import { invalidateAll } from "$app/navigation";
	import { page } from "$app/stores";
	import { PUBLIC_APP_NAME } from "$env/static/public";
	import { URLS } from "$lib/addresses";
	import pen from "$lib/assets/pen.png";
	import upload from "$lib/assets/upload.png";
	import Login from "$lib/components/Login.svelte";
	import type { Account } from "$lib/services/Account";
	import { dialog, getDataURL } from "$lib/util";
	import type { ActionResult } from "@sveltejs/kit";
	import type { Result } from "./+page.server";
	import ApiKeyEditor from "./ApiKeyEditor.svelte";
	import IdentificationMethods from "./IdentificationMethods.svelte";

	export let form: Result;
	let account: Account;
	$: account = $page.data.userData;

	let pictureDataURL: string | undefined;
	let imgUpload: HTMLInputElement;
	let editMode = false;

	$: {
		if (browser && form?.message) {
			editMode = false;
			setTimeout(() => alert(form?.message), 0);
		}
	}

	async function handleSubmit(this: HTMLFormElement, event: SubmitEvent) {
		editMode = false;
		const data = new FormData(this);
		let kept = 0;
		for (const [k, v] of Array.from(data.entries())) {
			if (typeof v === "string" && account[k] === v) data.delete(k);
			else if (typeof v === "object" && "size" in v && v.size === 0) data.delete(k);
			else kept++;
		}
		if (!kept) {
			return;
		}

		const response = await fetch(this.action, {
			method: "POST",
			body: data,
		});
		const result: ActionResult = await response.json();

		if (result.type === "success") {
			await invalidateAll();
		}

		applyAction(result);
	}
</script>

<svelte:head>
	<title>Account - {PUBLIC_APP_NAME}</title>
</svelte:head>
{#if !account}
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
		<div class="relative mb-2 h-40 w-40">
			<button
				on:click={() => {
					navigator.clipboard.writeText(`${location.origin}${URLS.USERS}/${account.username}`);
					dialog(`Copied profile link to clipboard`, 2, 1);
				}}
				class="absolute right-0 top-0 hover:drop-shadow-md">🔗</button
			>
			<div
				id={editMode ? "pcont" : ""}
				on:click={() => editMode && imgUpload.click()}
				class:cursor-pointer={editMode}
				class="relative grid place-items-center w-full h-full rounded-full border-8 border-white overflow-hidden dark:border-neutral-700"
			>
				<img id="poverlay" alt="upload" class="" src={upload} />
				<div id="poverlay2" alt="" class="invert dark:invert-0 bg-black/30" />
				<img
					alt="profile"
					class="object-cover w-full h-full"
					src={pictureDataURL ?? account.picture}
				/>
			</div>
		</div>

		<div class="grid grid-cols-[auto_auto] gap-x-3">
			{#each ["Username", "Name", "Bio", "Email"] as field}
				<h2 class="text-right">{field}:</h2>
				{#if !editMode}
					<div>
						<h2 class="text-left font-bold inline">{account[field.toLowerCase()] ?? ""}</h2>
						{#if field !== "Email"}
							<img
								on:click={() => (editMode = true)}
								class="dark:invert cursor-pointer h-6 w-6 inline align-baseline ml-3"
								src={pen}
							/>
						{/if}
					</div>
				{:else if field === "Email"}
					<h2 class="text-left font-bold inline">{account[field.toLowerCase()] ?? ""}</h2>
				{:else}
					<input
						form="editform"
						name={field.toLowerCase()}
						class="h-full text-2xl bg-transparent border-b font-bold text-left w-full"
						value={account[field.toLowerCase()] ?? ""}
					/>
				{/if}
			{/each}
			{#if editMode}
				<div />
				<form
					class="hidden"
					id="editform"
					on:submit|preventDefault={handleSubmit}
					method="POST"
					action="?/editprofile"
				/>
				<div>
					<button type="submit" class="cont w-48 mt-3" form="editform">Save</button>
					<button
						on:click={() => ((editMode = false), (pictureDataURL = undefined))}
						class="cont w-32 mt-3">Cancel</button
					>
				</div>
			{/if}
		</div>

		<IdentificationMethods {account} />

		<div class="h-10" />
		<form method="POST" class="contents">
			<button formaction="?/revoke" type="submit" class="cont w-60">Revoke logins</button>
			<button formaction="?/logout" type="submit" class="cont w-60">Sign out</button>
		</form>
		<form method="POST" on:submit={() => confirm("Delete account")} action="?/deleteaccount">
			<button type="submit" class="cont w-60">Delete account</button>
		</form>

		<div class="h-10" />
		<ApiKeyEditor apiKeys={account.apiKeys} />
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
		filter: invert(1) brightness(200%);
	}
</style>
