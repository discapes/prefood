<script lang="ts">
	import type { FormData } from "./$types";
	/* this is comparable to the github and google endpoints,
	only instead of redirecting to a new url we send and email
	with the url */
	export let form: FormData;
</script>

{#if form.sent}
	<h1>Check your email</h1>
{:else}
	<form method="POST" action="?/newuser">
		<input class="hidden" name="passState" value={form.passState} />
		<label for="name">Email</label>
		<input name="email" value={form.email} />
		<label for="name">Name</label>
		<input name="name" />
		<label for="picture">Picture</label>
		<input name="picture" />
	</form>
{/if}
