<script context="module">
	export const prerender = true;
</script>

<script lang="ts">
	import Header from '$lib/header/Header.svelte';
	import { setContext } from 'svelte';
	import { writable } from 'svelte/store';
	import type { Writable } from 'svelte/store';
	import '../theme.css';
	import '../classes.scss';

	let darkmode: Writable<boolean | null> = writable(null);
	setContext('darkmode', darkmode);

	function darkmodetoggle() {
		document.body.classList.toggle('dark');
		$darkmode = document.body.classList.contains('dark');
		localStorage.setItem('darkmode', $darkmode.toString());
	}
</script>

<div class="flex flex-col min-h-[100vh]">
	<script>
		$darkmode = localStorage.getItem('darkmode') == 'true';
		if ($darkmode) document.body.classList.add('dark');
		else document.body.classList.remove('dark');
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

<style>
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
