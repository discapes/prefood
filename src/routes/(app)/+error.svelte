<script lang="ts">
	import { page } from "$app/stores";
	import { PUBLIC_APP_NAME } from "$env/static/public";
	import Banner from "$lib/components/Banner.svelte";
</script>

<svelte:head>
	<title>{$page.status} - {PUBLIC_APP_NAME}</title>
</svelte:head>

<Banner
	title={$page.status?.toString?.()}
	subtitle={$page.error?.message ?? "Unexpected error"}
/>
