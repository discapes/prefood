<script context="module">
	// return {
	// 	cache: "1 hour"??;
	// }
	export const prerender = false;
</script>

<script lang="ts">
	type MenuItem = {
		name: string;
		price_cents: number;
		checked?: boolean;
	};

	export let menu: MenuItem[];
	export let name: string;
	if (!menu) menu = [];

	function order() {
		const items = menu.filter((i) => i.checked);
		if (!items.length) alert(`Select some items.`);
		else alert(`Pretend you just paid for and recieved: ${items.map((i) => i.name).join(', ')}.`);
	}
</script>

<svelte:head>
	<title>{name} - pizzapp</title>
</svelte:head>

<section class="flex flex-col gap-10 items-center p-10">
	<ol class="flex gap-3 flex-wrap">
		{#each menu as item (item.name)}
			<li on:click={() => (item.checked = !item.checked)} class="p-5 btn">
				<div class="btn flex items-center p-10 gap-3">
					<input
						bind:checked={item.checked}
						class="bg-slate-300 dark:bg-neutral-800 rounded-full w-8 h-8 checkinput"
						type="checkbox"
					/>
					{item.name}
					<span class="bg-slate-200 dark:bg-neutral-700 -m-1 rounded p-1"
						>{(item.price_cents / 100).toFixed(2).replace('.', ',')}&nbsp€</span
					>
				</div>
			</li>
		{/each}
	</ol>
	<button on:click={order} class="uppercase btn tracking-widest"> Order </button>
</section>

<style>
	.checkinput {
		--checkbox-color: var(--text-color);
	}
</style>
