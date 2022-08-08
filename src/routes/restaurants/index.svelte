<script context="module">
	// return {
	// 	cahce: "no cache, invalidate this manually and refresh? or do swr?"??;
	// }
</script>

<script lang="ts">
	import type { Restaurant } from 'src/types/types';
	import { fly } from 'svelte/transition';

	export let restaurants: Restaurant[] = [];
</script>

<svelte:head>
	<title>Restaurants - pizzapp</title>
</svelte:head>

<section in:fly={{ duration: 200, y: 200 }} class="flex justify-center p-10">
	<ol class="flex gap-10 flex-wrap">
		{#each restaurants as res (res.name)}
			<li class="block btn scale">
				<a class="nolink" sveltekit:prefetch href={`restaurants/${res.name}`}>
					<div class="btn m-2">
						<span class="text-4xl m-2">{res.name}</span>
					</div>
				</a>
			</li>
		{/each}
	</ol>
</section>
