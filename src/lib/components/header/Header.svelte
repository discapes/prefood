<script lang="ts">
	import { page } from "$app/stores";
	import { HEADERPAGES, URLS } from "$lib/addresses";
	import { createEventDispatcher } from "svelte";
	import logo from "./svelte-logo.svg";

	const dispatch = createEventDispatcher();

	$: userData = $page.data.userData;
</script>

<header>
	{#if userData}
		<a
			href={URLS.ACCOUNT}
			data-sveltekit-prefetch=""
			class="corner inline-flex justify-end items-end"
		>
			<img
				alt="profile"
				class="object-cover w-5/6 h-5/6 border border-white dark:border-neutral-400"
				src={userData.picture}
			/>
		</a>
	{:else}
		<div class="corner inline-flex justify-end items-end">
			<a class="w-5/6 h-5/6" href={URLS.ACCOUNT}>
				<img class="w-full h-full" src={logo} alt="SvelteKit" />
			</a>
		</div>
	{/if}

	<nav>
		<svg viewBox="0 0 2 3" aria-hidden="true">
			<path d="M0,0 L1,2 C1.5,3 1.5,3 2,3 L2,0 Z" />
		</svg>
		<ul class="flex flex-col py-2 rounded-b-xl gap-1 sm:flex-row sm:py-0 sm:rounded-none">
			{#each HEADERPAGES as listedPage}
				<li class:active={$page.url.pathname === listedPage.path}>
					<a data-sveltekit-prefetch href={listedPage.path}>{listedPage.name}</a>
				</li>
			{/each}
		</ul>
		<svg viewBox="0 0 2 3" aria-hidden="true">
			<path d="M0,0 L0,3 C0.5,3 0.5,3 1,2 L2,0 Z" />
		</svg>
	</nav>

	<div class="corner inline-flex justify-start items-end">
		<button
			class="w-5/6 h-5/6 rounded-bl darkmodetoggle"
			on:click={() => dispatch("darkmodetoggle")}
		/>
	</div>
</header>

<style>
	.darkmodetoggle {
		background-image: url("/moon.png");
		background-size: contain;
		background-repeat: no-repeat;
		filter: invert(100%);
		background-position: center left;
	}

	:global(.dark) .darkmodetoggle {
		background: url("/sun.png");
		background-repeat: no-repeat;
		background-size: contain;
		background-position: center left;
	}

	header {
		display: flex;
		justify-content: space-between;
	}

	.corner {
		width: 3em;
		height: 3em;
	}

	.corner img {
		object-position: center right;
	}

	nav {
		display: flex;
		justify-content: center;
		--background: var(--header-color);
	}

	svg {
		width: 2em;
		height: 3em;
		display: block;
	}

	path {
		fill: var(--background);
	}

	ul {
		position: relative;
		/* height: 3em; */
		display: flex;
		justify-content: center;
		align-items: center;
		list-style: none;
		background: var(--background);
		background-size: contain;
	}

	li {
		position: relative;
		height: 100%;
	}

	li.active::before {
		--size: 6px;
		content: "";
		width: 0;
		height: 0;
		position: absolute;
		top: -5px;
		left: calc(50% - var(--size));
		border: var(--size) solid transparent;
		border-top: var(--size) solid var(--accent-color);
	}
	@media (min-width: 640px) {
		li.active::before {
			top: 0;
		}
	}

	nav a {
		display: flex;
		height: 100%;
		align-items: center;
		padding: 0 1em;
		color: var(--heading-color);
		font-weight: 700;
		font-size: 0.8rem;
		text-transform: uppercase;
		letter-spacing: 0.1em;
		text-decoration: none;
		transition: color 0.2s linear;
	}

	a:hover {
		color: var(--accent-color);
	}
</style>
