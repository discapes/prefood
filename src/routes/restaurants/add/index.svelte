<script lang="ts">
	import { inputValidator, numberValidator } from '$lib/util';

	import type { MenuItem, Restaurant } from 'src/types/types';
	import { fly } from 'svelte/transition';

	let name: string | undefined;
	let stars: number | undefined;
	let reviews: number | undefined;
	let menu: Partial<MenuItem>[] = [{}];

	async function save() {
		if (!name || typeof stars !== 'number' || typeof reviews !== 'number') return alert('Enter all restaurant fields correctly.');
		if (!menu.every((i) => i.name && i.image && typeof i.price_cents == 'number')) return alert('Fill all menu fields correctly.');

		const restaurant: Restaurant = {
			name,
			stars,
			reviews,
			menu: <MenuItem[]>menu
		};

		const res = await fetch(location.href, {
			method: 'POST',
			body: JSON.stringify({ restaurant, action: 'set' })
		});
		if (res.ok) location.reload();
		else alert(`Error: ${res.statusText}`);
	}

	async function del() {
		if (!name) return alert('Enter restaurant name correctly.');
		const res = await fetch(location.href, {
			method: 'POST',
			body: JSON.stringify({ name, action: 'delete' })
		});
		if (res.ok) location.reload();
		else alert(`Error: ${res.statusText}`);
	}
</script>

<h1>Add restaurants</h1>

<div class="max-w-lg flex gap-5">
	<div class="flex flex-col gap-3">
		<div class="flex flex-col">
			<label for="name">Name</label>
			<input use:inputValidator={name} bind:value={name} class="cont" name="name" placeholder="Name" />
		</div>
		<div class="flex flex-col">
			<label for="stars">Stars </label>
			<input type="number" use:numberValidator={stars} bind:value={stars} class="cont" name="stars" placeholder="Stars" />
		</div>
		<div class="flex flex-col">
			<label for="reviews">Reviews</label>
			<input type="number" use:numberValidator={reviews} bind:value={reviews} class="cont" name="reviews" placeholder="Reviews" />
		</div>
		<button class="cont" on:click={save}>Save</button>
		<button class="cont" on:click={del}>Delete</button>
	</div>
	<div class="flex flex-col gap-3">
		Menu items:
		{#each menu as item}
			<div class="flex flex-col gap-1" transition:fly={{ duration: 200 }}>
				<input class="cont w-full" use:inputValidator={item.name} bind:value={item.name} placeholder="Item name" />
				<div class="flex gap-2 items-center">
					<input type="number" class="cont" use:numberValidator={item.price_cents} bind:value={item.price_cents} placeholder="Item price" />
					cents
				</div>
				<input class="cont w-full" use:inputValidator={item.image} bind:value={item.image} placeholder="Image url" />
			</div>
		{/each}
		<button on:click={() => (menu = [...menu, {}])} class="cont w-full">+</button>
	</div>
</div>
