<script lang="ts">
	import { page } from "$app/stores";
	import Banner from "$lib/Banner.svelte";
</script>

<svelte:head>
	<title>{$page.status} - pizzapp</title>
</svelte:head>

<Banner title={$page.status.toString()} subtitle={$page.error.message} />
