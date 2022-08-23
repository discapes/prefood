<script lang="ts">
	import { decodeB64URL } from "$lib/util";
	import { onMount } from "svelte";

	let token: string;
	let email: string;

	onMount(() => {
		const options = JSON.parse(decodeB64URL(new URL(location.href).searchParams.get("o")!));
		({ email, token } = options);
	});
</script>

<svelte:head>
	<title>pizzapp</title>
</svelte:head>

<section class="flex justify-center p-10">
	<form class="flex flex-col gap-3 justify-center w-full" method="post">
		<input name="token" class="hidden" value={token} />
		<input name="email" class="cont w-full brightness-90 outline-none" readonly value={email} />
		<input name="name" class="cont w-full" placeholder="name" />
		<button type="submit" class="cont w-full basis-0 whitespace-nowrap"> Create account</button>
	</form>
</section>
