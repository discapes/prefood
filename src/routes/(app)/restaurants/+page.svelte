<script lang="ts">
	import type { PageData } from "./$types";
	import { fly } from "svelte/transition";
	import { PUBLIC_APP_NAME } from "$env/static/public";

	export let data: PageData;
</script>

<svelte:head>
	<title>Restaurants - {PUBLIC_APP_NAME}</title>
</svelte:head>

<section in:fly={{ duration: 200, y: 200 }} class="flex justify-center p-10">
	<ol class="flex gap-10 flex-wrap">
		{#each data.restaurants as res (res.name)}
			<li class="">
				<a class="nolink block btn scale" href={`restaurants/${res.name}`}>
					<div class="btn m-2">
						<span class="text-4xl">{res.name}</span>
					</div>
				</a>
			</li>
		{/each}
	</ol>
</section>
