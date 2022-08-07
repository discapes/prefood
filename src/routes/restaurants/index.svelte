<script context="module">
	// return {
	// 	cahce: "no cache, invalidate this manually and refresh? or do swr?"??;
	// }
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
	<ol class="flex gap-10">
		{#each restaurants as res (res.slug)}
			<li class="block btn scale">
				<a class="nolink" sveltekit:prefetch href={`restaurants/${res.slug}`}>
					<div class="btn m-2">
						<span class="text-4xl m-2">{res.name}</span>
					</div>
				</a>
			</li>
		{/each}
	</ol>
</section>
