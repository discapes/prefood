<script lang="ts">
	import Header from "$lib/components/header/Header.svelte";
	import cookie from "cookie";
	import { onMount, setContext } from "svelte";
	import type { Writable } from "svelte/store";
	import { writable } from "svelte/store";
	import { v4 as uuidv4 } from "uuid";
	import type { PageData } from "./$types";
	import "$lib/../styles/theme.css";
	import { PUBLIC_APP_NAME } from "$env/static/public";

	let darkmode: Writable<boolean | null> = writable(null);
	setContext("darkmode", darkmode);

	function darkmodetoggle() {
		document.body.classList.toggle("dark");
		$darkmode = document.body.classList.contains("dark");
		localStorage.setItem("darkmode", $darkmode.toString());
	}

	let stateToken: Writable<string | null> = writable(null);
	setContext("stateToken", stateToken);
	onMount(() => {
		$stateToken = cookie.parse(document.cookie).state;
		if (!$stateToken) {
			$stateToken = uuidv4();
			document.cookie = `state=${$stateToken}; Path=/`;
		}
		console.log({ $stateToken });
	});
</script>

<!-- {#if dev}
	{JSON.stringify($page.data)}
{/if} -->
<svelte:head>
	<title>{PUBLIC_APP_NAME}</title>
</svelte:head>
<div class="flex flex-col min-h-[100vh]">
	<script>
		$darkmode = localStorage.getItem("darkmode") == "true";
		if ($darkmode) document.body.classList.add("dark");
		else document.body.classList.remove("dark");
	</script>
	<Header on:darkmodetoggle={darkmodetoggle} />

	<main class="grow flex flex-col items-center">
		<slot />
	</main>

	<footer>
		<p class="border border-black/30 dark:border-white/40 p-3 rounded">
			made with <a href="https://kit.svelte.dev">sveltekit</a>
		</p>
	</footer>
</div>

<style lang="scss">
	:global {
		@import "classes.scss";
	}
	main {
		flex: 1;
		display: flex;
		flex-direction: column;
		padding: 1rem;
		width: 100%;
		max-width: 1024px;
		margin: 0 auto;
		box-sizing: border-box;
	}

	footer {
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		padding: 40px;
	}

	footer a {
		font-weight: bold;
	}

	@media (min-width: 480px) {
		footer {
			padding: 40px 0;
		}
	}
</style>
