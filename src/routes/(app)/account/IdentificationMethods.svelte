<script lang="ts">
	import { enhance } from "$app/forms";
	import GithubButton from "$lib/components/GithubButton.svelte";
	import { page } from "$app/stores";
	import type { Account } from "$lib/services/Account";
	import { formFrom, getEncoder } from "$lib/util";
	import { LinkParameters } from "$lib/types";
	import GoogleButton from "$lib/components/GoogleButton.svelte";
	import { URLS } from "$lib/addresses";
	import type { Writable } from "svelte/types/runtime/store";
	import { getContext } from "svelte";
	import { invalidateAll } from "$app/navigation";

	export let account: Account;

	const stateToken: Writable<string> = getContext("stateToken");

	let linkparams: Omit<LinkParameters, "method">;
	$: linkparams = {
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
				passState: getEncoder(LinkParameters).encode({ ...linkparams, method: "email" }),
			}),
		}).then((res) => res.json());
		console.log(res);
	}
</script>

<h2>Identification methods</h2>
<div class="grid grid-cols-2 gap-y-2 gap-x-6">
	<div class="bg-lime-300/50 rounded px-1 w-full h-full flex items-center">
		<span class="text-xl">Email</span>
	</div>
	<button on:click={changeEmail} class="cont w-full h-full">Change</button>
	<div
		class="{account.githubID
			? 'bg-lime-300/50'
			: 'bg-rose-300/50'} rounded px-1 w-full h-full flex items-center"
	>
		<span class="text-xl">Github</span>
	</div>
	{#if account.githubID}
		<form method="POST" use:enhance={() => invalidateAll} action="?/unlink">
			<button type="submit" name="method" value="githubID" class="cont w-full h-full"
				>Unlink</button
			>
		</form>
	{:else}
		<GithubButton
			text="Link Github"
			redirect_uri={`${$page.url.origin}${URLS.LINK}`}
			passState={getEncoder(LinkParameters).encode({ ...linkparams, method: "githubID" })}
		/>
	{/if}
	<div
		class="{account.googleID
			? 'bg-lime-300/50'
			: 'bg-rose-300/50'} rounded px-1 w-full h-full flex items-center"
	>
		<span class="text-xl">Google</span>
	</div>
	{#if account.googleID}
		<form method="POST" use:enhance={() => invalidateAll} action="?/unlink">
			<button type="submit" name="method" value="googleID" class="cont w-full h-full"
				>Unlink</button
			>
		</form>
	{:else}
		<GoogleButton
			text="Link Google"
			redirect_uri={`${$page.url.origin}${URLS.LINK}`}
			passState={getEncoder(LinkParameters).encode({ ...linkparams, method: "googleID" })}
		/>
	{/if}
</div>
