<script lang="ts">
	import Header from "$lib/components/header/Header.svelte";
	import cookie from "cookie";
	import { onMount, setContext } from "svelte";
	import type { Writable } from "svelte/store";
	import { writable } from "svelte/store";
	import { uuid } from "$lib/util";
	import "$lib/../styles/theme.css";
	import { PUBLIC_APP_NAME } from "$env/static/public";
	import { HEADERPAGES } from "$lib/addresses";

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
			$stateToken = uuid();
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

	<main class="grow p-14">
		<slot />
	</main>

	<footer class="bg-stone-700 text-neutral-300 text-lg p-5 pt-10 flex flex-col w-full items-center gap-10">
		<div class="flex justify-evenly grow w-full">
			<div>
				<p class="text-3xl font-bold mb-4">PreFood</p>
				<p class="max-w-md">
					Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever
					since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five
					centuries, but also the leap into electronic typesetting, remaining essentially unchanged.
				</p>
			</div>
			<div class="flex flex-col">
				<b class="text-3xl mb-4">Navigation</b>
				{#each HEADERPAGES as hp}
					<a class="hover:underline" href={hp.path}>{hp.name}</a>
				{/each}
			</div>
			<div class="flex flex-col">
				<b class="text-3xl mb-4">Contact</b>
				<span>Turku, Finland</span>
				<span>miika.km.tuominen@gmail.com</span>
			</div>
		</div>
		<p class="text-center">
			© {new Date().getFullYear()} Miika Tuominen
		</p>
	</footer>
</div>

<style lang="scss">
	:global {
		@import "classes.scss";
	}
	// main {
	// 	flex: 1;
	// 	display: flex;
	// 	flex-direction: column;
	// 	padding: 1rem;
	// 	width: 100%;
	// 	max-width: 1024px;
	// 	margin: 0 auto;
	// 	box-sizing: border-box;
	// }

	// footer {
	// 	display: flex;
	// 	flex-direction: column;
	// 	justify-content: center;
	// 	align-items: center;
	// 	padding: 40px;
	// }

	// @media (min-width: 480px) {
	// 	footer {
	// 		padding: 40px 0;
	// 	}
	// }
</style>
