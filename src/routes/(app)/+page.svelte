<script lang="ts">
	import { PUBLIC_APP_NAME } from "$env/static/public";
	import Counter from "$lib/components/Counter.svelte";
</script>

<svelte:head>
	<title>Home - {PUBLIC_APP_NAME}</title>
	<meta name="description" content="Svelte demo app" />
	<style>
		main {
			padding: 0 !important;
		}
	</style>
</svelte:head>

<section class="flex flex-col">
	<div class="grid grid-cols-3 w-full min-h-[600px] relative text-white">
		<img src="burger.jpg" class="-z-10 absolute h-full right-0 object-cover max-w-full" />
		<div class="bg-rose-600 heading p-20 flex">
			<h1 class="font-extrabold basis-0 text-8xl text-left">Fastest way to order food</h1>
			<div />
		</div>
		<div class="bg-rose-600 text-9xl title flex items-center justify-center">&nbsp;PreFood&nbsp;</div>
		<div class="w-full bg-gradient-to-r from-rose-600" />
	</div>
	<div class="flex justify-center bg-rose-600">
		<div class="inline-grid grid-cols-2 gap-20 justify-items-center p-20 text-rose-600 font-semibold">
			<div class="card">
				<b class="text-6xl"> 1.</b>
				<p class="text-3xl">Pick a restaurant</p>
			</div>
			<div class="card">
				<b class="text-6xl">2.</b>
				<p class="text-3xl">Select a nice meal</p>
			</div>
			<div class="card">
				<b class="text-6xl">3.</b>
				<p class="text-3xl">Pick it up</p>
			</div>
			<div class="card">
				<b class="text-6xl">4.</b>
				<p class="text-3xl">Enjoy!</p>
			</div>
		</div>
	</div>
	<div class="bg-rose-600 flex justify-center items-center p-20 pb-40">
		<a href="/about" class="cursor-pointer text-white text-6xl bg-rose-500 p-10 rounded-[30px] card2">About Us</a>
	</div>
</section>

<style>
	.card {
		@apply w-80 h-48 bg-rose-100 rounded-[30px] flex items-center p-10 gap-5;
		box-shadow: 0px 0px 5px 6px rgb(255 228 230), inset 0 0 10px rgb(225 29 72);
	}

	.card2 {
		box-shadow: inset 0 0 10px rgb(225 29 72);
	}

	.title {
		text-decoration: underline overline;
		text-underline-offset: 20px;
	}
</style>
