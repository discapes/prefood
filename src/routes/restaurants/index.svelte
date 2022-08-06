<script context="module">
	// return {
	// 	cahce: "no cache, invalidate this manually and refresh? or do swr?"??;
	// }
	export const prerender = false;
</script>

<script lang="ts">
	type Restaurant = {
		name: string;
		slug: string;
	};

	export let restaurants: Restaurant[] = [];
</script>

<svelte:head>
	<title>Restaurants - pizzapp</title>
</svelte:head>

<section class="flex justify-center p-10">
	<ol class="flex gap-3">
		{#each restaurants as res (res.slug)}
			<li class="block btn p-5 hover:underline">
				<a class="btn" sveltekit:prefetch href={`restaurants/${res.slug}`}> {res.name}</a>
			</li>
		{/each}
	</ol>
</section>
