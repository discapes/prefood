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
		body {
			background: rgb(5 150 105) !important;
		}
	</style>
</svelte:head>

<section class="flex flex-col bg-emerald-600 md:bg-transparent">
	<div class="md:grid grid-cols-[repeat(auto-fit,_minmax(550px,_1fr));] w-full pb-10 md:pb-0 md:min-h-[600px] relative text-white">
		<img src="burger.jpg" class="-z-10 hidden md:block  absolute h-full right-0 object-cover max-w-full" />
		<div class="bg-emerald-600 heading p-20 w-full md:flex md:pt-20">
			<h1 class="font-extrabold basis-0 text-5xl md:text-8xl sm:text-left">Fastest way to order food</h1>
			<div class="hidden md:block" />
		</div>
		<div class="bg-emerald-600 text-6xl sm:text-8xl md:text-[7rem] title flex items-center justify-center">&nbsp;PreFood&nbsp;</div>
		<div class="w-full bg-gradient-to-r via-transparent from-emerald-600" />
	</div>
	<div class="flex justify-center bg-emerald-600">
		<div class="inline-grid grid-cols-1 md:grid-cols-2 gap-20 justify-items-center p-20 text-emerald-600 font-semibold">
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
	<div class="bg-emerald-600 flex justify-center items-center p-20 pb-40 text-center">
		<a href="/about" class="cursor-pointer text-white text-6xl bg-emerald-500 p-10 rounded-[30px] card2">About the app</a>
	</div>
</section>

<style>
	.card {
		@apply w-80 h-48 bg-emerald-100 rounded-[30px] flex items-center p-10 gap-5;
		box-shadow: 0px 0px 5px 6px rgb(255 228 230), inset 0 0 10px rgb(5 150 105);
	}

	.card2 {
		box-shadow: inset 0 0 10px rgb(5 150 105);
	}

	.title {
		text-decoration: underline overline;
		text-underline-offset: 20px;
	}
</style>
