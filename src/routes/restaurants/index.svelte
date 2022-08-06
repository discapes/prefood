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

<section class="flex justify-center">
	<ol class="flex gap-3">
		{#each restaurants as res (res.slug)}
			<a sveltekit:prefetch href={`restaurants/${res.slug}`}>
				<li class="text-xl block bg-white/80 hover:bg-white rounded p-5">{res.name}</li>
			</a>
		{/each}
	</ol>
</section>
