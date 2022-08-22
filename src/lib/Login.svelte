<script lang="ts">
	import GoogleButton from "./GoogleButton.svelte";
	import GithubButton from "./GithubButton.svelte";
	import { page } from "$app/stores";

	let rememberMe = true;

	let emailLoginReply = "";

	async function emailLogin(e: SubmitEvent) {
		const email = new FormData(e.target as HTMLFormElement).get("email");
		(<HTMLFormElement>e.target).reset();

		const emailLoginURL = `${$page.url.origin}/account/login/email?email=${email}&options=${JSON.stringify({
			opts: { rememberMe },
			referer: $page.url.href,
		})}`;
		await fetch(emailLoginURL).then(async (res) => {
			if (res.ok) {
				emailLoginReply = await res.text();
			} else {
				emailLoginReply = `${res.status} - ${await res.text()}!`;
			}
		});
	}
</script>

<svelte:head>
	<link href="https://fonts.googleapis.com/css2?family=Roboto:wght@100;400&display=swap" rel="stylesheet" />
</svelte:head>

<div class="flex flex-col gap-10 items-center">
	<h1 class="mb-0">Sign in</h1>

	<div class="flex gap-3 font-['Roboto'] justify-center flex-wrap">
		<GoogleButton opts={{ rememberMe }} />
		<GithubButton opts={{ rememberMe }} />
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
