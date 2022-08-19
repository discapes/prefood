<script lang="ts">
	import type { PageData } from "./$types";
	import { fly } from "svelte/transition";

	export let data: PageData;
</script>

<svelte:head>
	<title>Restaurants - pizzapp</title>
</svelte:head>

<section in:fly={{ duration: 200, y: 200 }} class="flex justify-center p-10">
	<ol class="flex gap-10 flex-wrap">
		{#each data.restaurants as res (res.name)}
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
