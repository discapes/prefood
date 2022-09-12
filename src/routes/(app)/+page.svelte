<script lang="ts">
	import { PUBLIC_APP_NAME } from "$env/static/public";
	import Counter from "$lib/components/Counter.svelte";
</script>

<svelte:head>
	<title>Home - {PUBLIC_APP_NAME}</title>
	<meta name="description" content="Svelte demo app" />
</svelte:head>

<section>
	<h1>
		<span class="welcome">
			<picture>
				<source srcset="svelte-welcome.webp" type="image/webp" />
				<img src="svelte-welcome.png" alt="" />
			</picture>
		</span>

		to <a href="https://miikat.dev"><b>Miika</b></a>'s<br />totally cool <br /><span class="tracking-widest">webapp</span>
	</h1>

	<h2 class=" border-b border-black dark:border-white flex gap-3">
		Here's a <b class="tracking-[8px]">counter:</b>
	</h2>

	<Counter />
</section>

<style>
	section {
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		flex: 1;
	}

	h1 {
		width: 100%;
	}

	.welcome {
		display: block;
		position: relative;
		width: 100%;
		height: 0;
		padding: 0 0 calc(100% * 495 / 2048) 0;
	}

	.welcome img {
		position: absolute;
		width: 100%;
		height: 100%;
		top: 0;
		display: block;
	}
</style>
