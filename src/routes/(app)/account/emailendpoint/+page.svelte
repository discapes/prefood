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

{#if form && form.sent}
	<h1>Check your email</h1>
{:else if form}
	<div class="flex justify-center mt-10">
		<form use:enhance method="POST" class="flex flex-col gap-5 max-w-[800px] justify-center" action="?/newuser">
			<input class="hidden" name="passState" value={form.passState} />
			<label for="name">Email</label>
			<input class="text-stone-900 p-1" name="email" value={form.email} />
			<label for="name">Name</label>
			<input class="text-stone-900 p-1" name="name" />
			<label for="picture">Picture</label>
			<input class="text-stone-900 p-1" name="picture" />
			<button type="submit" class="w-60 cont">Create account</button>
		</form>
	</div>
{:else}
	How did you get here?
{/if}
