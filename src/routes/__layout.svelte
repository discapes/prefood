<script lang="ts">
	import Header from '$lib/header/Header.svelte';
	import '../theme.css';
	import '../classes.css';
</script>

<div class="flex flex-col min-h-[100vh]">
	<Header />

	<main class="grow flex flex-col">
		<slot />
	</main>

	<footer>
		<p class="border border-black dark:border-white p-3">
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
