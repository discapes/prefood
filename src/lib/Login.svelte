<script lang="ts">
	import GoogleButton from "./GoogleButton.svelte";
	import GithubButton from "./GithubButton.svelte";

	let rememberMe = true;
</script>

<svelte:head>
	<link href="https://fonts.googleapis.com/css2?family=Roboto:wght@100;400&display=swap" rel="stylesheet" />
</svelte:head>

<div class="flex flex-col gap-10 items-center">
	<h1 class="mb-0">Sign in</h1>

	<div class="flex gap-3 items font-['Roboto']">
		<GoogleButton {rememberMe} />
		<GithubButton {rememberMe} />
	</div>

	<div class="flex gap-3 items-stretch">
		<label for="rememberMe">Remember me:</label>
		<input bind:checked={rememberMe} type="checkbox" class="bg-white/90 dark:bg-white/20 w-8 h-8 rounded-full" name="rememberMe" />
	</div>
</div>
