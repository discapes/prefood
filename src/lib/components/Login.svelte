<script lang="ts">
	import { enhance } from "$app/forms";
	import { page } from "$app/stores";
	import { CONTEXT, URLS } from "$lib/addresses";
	import { LoginParameters } from "$lib/types/misc";
	import { getEncoder } from "$lib/util";
	import { getContext } from "svelte";
	import GithubButton from "./GithubButton.svelte";
	import GoogleButton from "./GoogleButton.svelte";

	let stateToken: string = getContext(CONTEXT.STATETOKEN);
	let rememberMe = true;

	let params: Omit<LoginParameters, "method">;
	$: params = {
		type: "login",
		rememberMe,
		referer: $page.url.pathname,
		stateToken,
	};
</script>

<svelte:head>
	<link href="https://fonts.googleapis.com/css2?family=Roboto:wght@100;400&display=swap" rel="stylesheet" />
</svelte:head>

<div class="flex justify-center p-20">
	<div class="flex flex-col gap-10 items-center max-w-lg ">
		<h1 class="mb-0">Sign in</h1>
		<div class="flex flex-col gap-3 items-center">
			<div class="flex gap-3 font-['Roboto'] justify-center flex-wrap sm:flex-nowrap">
				<GoogleButton passState={getEncoder(LoginParameters).encode({ ...params, method: "googleID" })} />
				<GithubButton passState={getEncoder(LoginParameters).encode({ ...params, method: "githubID" })} />
			</div>

			<form
				method="POST"
				class="flex gap-3 justify-center w-full flex-wrap  max-w-[200px] sm:flex-nowrap sm:max-w-none"
				action={URLS.EMAILENDPOINT + `?/loginlink`}
			>
				<input name="email" class="cont w-full" placeholder="user@example.com" />
				<input class="hidden" name="passState" value={getEncoder(LoginParameters).encode({ ...params, method: "email" })} />
				<button type="submit" class="cont text-black w-full basis-0 whitespace-nowrap sm:max-w-none"> Sign in with email </button>
			</form>
		</div>
		<div class="flex gap-3 items-stretch">
			<label for="rememberMe">Remember me:</label>
			<input bind:checked={rememberMe} type="checkbox" class="bg-white/90 dark:bg-white/20 w-8 h-8 rounded-full" name="rememberMe" />
		</div>
	</div>
</div>
