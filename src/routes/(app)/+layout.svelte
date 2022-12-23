<script lang="ts">
	import { PUBLIC_APP_NAME } from "$env/static/public";
	import "$lib/../styles/theme.css";
	import { HEADERPAGES } from "$lib/addresses";
	import Header from "$lib/components/header/Header.svelte";
	import { setContext } from "svelte";
	import type { Writable } from "svelte/store";
	import { writable } from "svelte/store";
	import type { PageData } from "./$types";
	import { CONTEXT } from "$lib/addresses";

	export let data: PageData;
	setContext(CONTEXT.STATETOKEN, data.stateToken);

	let darkmode: Writable<boolean | null> = writable(null);
	setContext(CONTEXT.DARKMODE, darkmode);

	function onDarkModeToggle() {
		document.body.classList.toggle("dark");
		let newValue = document.body.classList.contains("dark");
		darkmode.set(newValue);
		localStorage.setItem("darkMode", newValue ? "true" : "false");
	}
</script>

<svelte:head>
	<title>{PUBLIC_APP_NAME}</title>
</svelte:head>
<div class="flex flex-col min-h-[100vh]">
	<script>
		if (localStorage.getItem("darkMode") == "true") document.body.classList.add("dark");
		else document.body.classList.remove("dark");
	</script>
	<Header on:darkmodetoggle={onDarkModeToggle} />

	<main class="grow p-14">
		<slot />
	</main>

	<footer class="bg-stone-700 text-neutral-300 text-lg p-5 pt-10 flex flex-col w-full items-center gap-10">
		<div class="flex flex-wrap gap-10 justify-evenly grow w-full">
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
				<a class="hover:underline" href="https://miikat.dev">miikat.dev</a>
				<a class="hover:underline" href="mailto:miika.km.tuominen@gmail.com">miika.km.tuominen@gmail.com</a>
				<span>Made in Turku, Finland</span>
			</div>
		</div>
		<p class="text-center">
			© {new Date().getFullYear()} Miika Tuominen
		</p>
	</footer>
</div>

<!-- </div> -->
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
