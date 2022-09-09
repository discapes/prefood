<!-- <script lang="ts">
	import { page } from "$app/stores";
	import Banner from "$lib/components/Banner.svelte";
</script>

<svelte:head>
	<title>{$page.status} - pizzapp</title>
</svelte:head>

<Banner title={$page.status?.toString?.()} subtitle={$page.error?.message ?? "Unexpected error"} /> -->
<script>
	import { page } from "$app/stores";
</script>

<h1>{$page.status}: {$page.error?.message}</h1>
