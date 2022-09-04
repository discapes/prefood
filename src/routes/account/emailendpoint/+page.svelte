<script lang="ts">
	import { goto } from "$app/navigation";

	import { enhance } from "@sveltejs/kit";

	import type { FormData } from "./$types";
	/* this is comparable to the github and google endpoints,
	only instead of redirecting to a new url we send and email
	with the url */
	export let form: FormData;
	const enhanceProps: Parameters<typeof enhance>[1] = {
		redirect: ({ location }) => goto(location),
		result: ({ response }) => (form = <any>response),
		invalid: ({ response }) => (form = <any>response),
	};
</script>

{#if form.sent}
	<h1>Check your email</h1>
{:else}
	<form use:enhance={enhanceProps} method="POST" action="?/newuser">
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
