<script lang="ts">
	import { PUBLIC_APP_NAME } from "$env/static/public";
	import Banner from "$lib/components/Banner.svelte";

	let title: string = "CANCEL";
	let subtitle: string = "didn't work, try again";
</script>

<svelte:head>
	<title>{title} - {PUBLIC_APP_NAME}</title>
	<meta name="description" content={subtitle} />
</svelte:head>

<Banner {title} {subtitle} />
