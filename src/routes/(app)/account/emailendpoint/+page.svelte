<script lang="ts">
	import { enhance } from "$app/forms";
	import { PUBLIC_APP_NAME } from "$env/static/public";
	import type { ActionData } from "./$types";

	/* this is comparable to the github and google endpoints,
	only instead of redirecting to a new url we send and email
	with the url */
	export let form: ActionData;
</script>

<svelte:head>
	<title>Signup - {PUBLIC_APP_NAME}</title>
</svelte:head>

{#if form.sent}
	<h1>Check your email</h1>
{:else}
	<form use:enhance method="POST" action="?/newuser">
		<input class="hidden" name="passState" value={form.passState} />
		<label for="name">Email</label>
		<input name="email" value={form.email} />
		<label for="name">Name</label>
		<input name="name" />
		<label for="picture">Picture</label>
		<input name="picture" />
		<button type="submit" class="w-60 cont">Create account</button>
	</form>
{/if}
