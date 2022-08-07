<script context="module">
	// return {
	// 	cache: "1 hour"??;
	// }
</script>

<script lang="ts">
	import { getRandomImage } from '$lib/util.js';
	import { onMount } from 'svelte';

	type MenuItem = {
		name: string;
		price_cents: number;
		checked?: boolean;
		image?: string;
	};

	export let menu: MenuItem[];
	export let name: string;
	export let slug: string;
	if (!menu) menu = [];
	let buttonLoading = false;
	$: buttonDisabled = menu.every((i) => !i.checked);

	onMount(() => {
		imageMenu(menu).then((imagedMenu) => (menu = imagedMenu));
		function imageMenu(menu) {
			return Promise.all(menu.map(async (i) => ({ ...i, image: await getRandomImage(i.name) })));
		}
	});
</script>

<svelte:head>
	<title>{name} - pizzapp</title>
</svelte:head>

<section>
	<form
		on:submit={() => (buttonLoading = true)}
		method="POST"
		action="/checkout"
		class="flex flex-col gap-10 items-center p-10"
	>
		<input type="text" name="restaurant-name" value={name} class="hidden" />
		<input type="text" name="restaurant-slug" value={slug} class="hidden" />
		<ol class="flex gap-3 flex-col">
			{#each menu as item (item.name)}
				<li on:click={() => (item.checked = !item.checked)} class="p-5 btn">
					<div class="btn flex items-center gap-3">
						<div
							class="rounded w-20 h-20 overflow-hidden border border-slate-200 dark:border-neutral-700"
						>
							<img alt="" class="object-cover h-full w-full" src={item.image ?? ''} />
						</div>
						<input
							name="item-{item.name}"
							bind:checked={item.checked}
							class="bg-slate-300 dark:bg-neutral-800 rounded-full w-8 h-8 checkinput"
							type="checkbox"
						/>
						{item.name}
						<span class="bg-slate-200 dark:bg-neutral-700 -m-1 rounded p-1 mr-1"
							>{(item.price_cents / 100).toFixed(2).replace('.', ',')}&nbsp€</span
						>
					</div>
				</li>
			{/each}
		</ol>
		<button
			disabled={buttonDisabled}
			class="btn tracking-wide w-[150px] h-[55px]"
			class:scale={!buttonLoading}
		>
			<div class:hidden={!buttonLoading} class="spinner3" />
			<pre
				class:hidden={buttonLoading}
				class:greyed={buttonDisabled}
				class="rounded text-3xl uppercase"> Order </pre>
		</button>
	</form>
</section>

<style>
	@import '../../../spinner.module.css';

	pre {
		background-color: rgba(150, 150, 150, 0.1);
		font-family: var(--font-mono);
		box-shadow: 2px 2px 6px #ffffff40;
	}

	:global(.dark) pre {
		background-color: rgba(255, 255, 255, 0.3);
	}
</style>
