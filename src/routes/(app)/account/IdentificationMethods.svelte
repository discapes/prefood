<script lang="ts">
	import { applyAction, enhance } from "$app/forms";
	import { page } from "$app/stores";
	import { CONTEXT } from "$lib/addresses";
	import GithubButton from "$lib/components/GithubButton.svelte";
	import GoogleButton from "$lib/components/GoogleButton.svelte";
	import type { Account } from "$lib/types/Account";
	import { LinkParameters } from "$lib/types/misc";
	import { formFrom, getEncoder } from "$lib/util";
	import { getContext } from "svelte";

	export let account: Account;

	const stateToken: string = getContext(CONTEXT.STATETOKEN);

	let linkparams: Omit<LinkParameters, "method">;
	$: linkparams = {
		type: "link",
		referer: $page.url.pathname,
		stateToken,
	};

	async function changeEmail() {
		const email = prompt("New email?");
		if (!email) return;
		const res = await fetch($page.url + `?/changeemail`, {
			method: "POST",
			body: formFrom({
				email,
				passState: getEncoder(LinkParameters).encode({ ...linkparams, method: "email" }),
			}),
		}).then((res) => res.json());
		applyAction(res);
	}
</script>

<h2>Identification methods</h2>
<div class="grid grid-cols-2 gap-y-2 gap-x-6">
	<div class="bg-lime-300/50 rounded px-1 w-full h-full flex items-center">
		<span class="text-xl">Email</span>
	</div>
	<button on:click={changeEmail} class="cont w-full h-full text-black">Change</button>
	<div class="{account.githubID ? 'bg-lime-300/50' : 'bg-rose-300/50'} rounded px-1 w-full h-full flex items-center">
		<span class="text-xl">Github</span>
	</div>
	{#if account.githubID}
		<form method="post" use:enhance action="?/unlink">
			<button type="submit" name="ident_method" value="githubID" class="text-black cont w-full h-full">Unlink</button>
		</form>
	{:else}
		<GithubButton text="Link Github" passState={getEncoder(LinkParameters).encode({ ...linkparams, method: "githubID" })} />
	{/if}
	<div class="{account.googleID ? 'bg-lime-300/50' : 'bg-rose-300/50'} rounded px-1 w-full h-full flex items-center">
		<span class="text-xl">Google</span>
	</div>
	{#if account.googleID}
		<form method="post" use:enhance action="?/unlink">
			<button type="submit" name="ident_method" value="googleID" class="text-black cont w-full h-full">Unlink</button>
		</form>
	{:else}
		<GoogleButton text="Link Google" passState={getEncoder(LinkParameters).encode({ ...linkparams, method: "googleID" })} />
	{/if}
</div>
