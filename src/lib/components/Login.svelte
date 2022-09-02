<script lang="ts">
	import GoogleButton from "./GoogleButton.svelte";
	import GithubButton from "./GithubButton.svelte";
	import { page } from "$app/stores";
	import { v4 as uuidv4 } from "uuid";
	import { URLS } from "../../lib./../lib/addresses";
	import { goto } from "$app/navigation";
	import { EmailEndpointOptions } from "$lib/types";
	import { getEncoder } from "$lib/util";

	let rememberMe = true;
	let emailLoginReply = "";
	const stateToken = uuidv4();

	async function emailLogin(e: SubmitEvent) {
		const email = new FormData(e.target as HTMLFormElement).get("email");
		if (!(typeof email === "string")) return;
		(<HTMLFormElement>e.target).reset();

		const options = getEncoder(EmailEndpointOptions).encode({
			rememberMe,
			referer: $page.url.pathname,
			email,
		});
		goto(URLS.EMAILENDPOINT + "?options=" + options);
	}
</script>

<svelte:head>
	<link href="https://fonts.googleapis.com/css2?family=Roboto:wght@100;400&display=swap" rel="stylesheet" />
</svelte:head>

<div class="flex flex-col gap-10 items-center">
	<h1 class="mb-0">Sign in</h1>

	<div class="flex gap-3 font-['Roboto'] justify-center flex-wrap">
		<GoogleButton {stateToken} text={undefined} opts={{ rememberMe, referer: $page.url.pathname }} />
		<GithubButton {stateToken} text={undefined} opts={{ rememberMe, referer: $page.url.pathname }} />
	</div>

	<form class="flex gap-3 justify-center w-full" on:submit|preventDefault={emailLogin}>
		<input name="email" class="cont w-full" placeholder="user@example.com" />
		<button type="submit" class="cont w-full basis-0 whitespace-nowrap"> Sign in with email </button>
	</form>
	{emailLoginReply}

	<div class="flex gap-3 items-stretch">
		<label for="rememberMe">Remember me:</label>
		<input bind:checked={rememberMe} type="checkbox" class="bg-white/90 dark:bg-white/20 w-8 h-8 rounded-full" name="rememberMe" />
	</div>
</div>
