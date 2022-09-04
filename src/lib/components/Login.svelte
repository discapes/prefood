<script lang="ts">
	import GoogleButton from "./GoogleButton.svelte";
	import GithubButton from "./GithubButton.svelte";
	import { page } from "$app/stores";
	import { v4 as uuidv4 } from "uuid";
	import { URLS } from "$lib/addresses";
	import { onMount } from "svelte";
	import { LoginParameters } from "$lib/types";
	import { getEncoder } from "$lib/util";
	import cookie from "cookie";

	let rememberMe = true;
	let stateToken: string;
	onMount(() => {
		stateToken = cookie.parse(document.cookie).state;
		if (!stateToken) {
			stateToken = uuidv4();
			document.cookie = `state=${stateToken}; Path=/`;
		}
	});

	let params: Omit<LoginParameters, "method">;
	$: params = {
		rememberMe,
		referer: $page.url.pathname,
		stateToken,
	};
</script>

<svelte:head>
	<link href="https://fonts.googleapis.com/css2?family=Roboto:wght@100;400&display=swap" rel="stylesheet" />
</svelte:head>

<div class="flex flex-col gap-10 items-center">
	<h1 class="mb-0">Sign in</h1>

	<div class="flex gap-3 font-['Roboto'] justify-center flex-wrap">
		<GoogleButton passState={getEncoder(LoginParameters).encode({ ...params, method: "googleID" })} />
		<GithubButton passState={getEncoder(LoginParameters).encode({ ...params, method: "githubID" })} />
	</div>

	<form method="POST" class="flex gap-3 justify-center w-full" action={URLS.EMAILENDPOINT}>
		<input name="email" class="cont w-full" placeholder="user@example.com" />
		<input class="hidden" name="passState" value={getEncoder(LoginParameters).encode({ ...params, method: "email" })} />
		<button type="submit" class="cont w-full basis-0 whitespace-nowrap"> Sign in with email </button>
	</form>

	<div class="flex gap-3 items-stretch">
		<label for="rememberMe">Remember me:</label>
		<input bind:checked={rememberMe} type="checkbox" class="bg-white/90 dark:bg-white/20 w-8 h-8 rounded-full" name="rememberMe" />
	</div>
</div>
