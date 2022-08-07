<script context="module">
	export const prerender = true;
</script>

<script lang="ts">
	import Banner from '$lib/Banner.svelte';

	let title: string = 'CANCEL';
	let subtitle: string = "didn't work, try again";
</script>

<svelte:head>
	<title>{title}</title>
	<meta name="description" content={subtitle} />
</svelte:head>

<Banner {title} {subtitle} />
