<!-- <script context="module">

	return {
		cahce: "1 hour"??;
	}
</script>
-->
<script lang="ts">
	type MenuItem = {
		name: string;
		price_cents: number;
		checked?: boolean;
	};

	export let menu: MenuItem[];
</script>

<section class="flex flex-col gap-10 items-center">
	<ol class="flex gap-3">
		{#each menu as item (item.name)}
			<li
				on:click={() => (item.checked = !item.checked)}
				class="cursor-pointer text-xl bg-white/80 hover:bg-white rounded p-5 flex gap-3"
			>
				<input
					bind:checked={item.checked}
					style="--checkbox-color: black"
					class="bg-slate-300 rounded-full w-8 h-8"
					type="checkbox"
				/>
				{item.name} <span class="bg-slate-200 -m-1 rounded p-1">${item.price_cents}</span>
			</li>
		{/each}
	</ol>
	<button class="uppercase"> Order </button>
</section>

<style>
</style>
