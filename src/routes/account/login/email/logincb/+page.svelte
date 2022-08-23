<script lang="ts">
	import type { PageData } from "./$types";

	export let data: PageData;

	// if yes then set cookies
</script>

<svelte:head>
	<title>pizzapp</title>
</svelte:head>

<section class="flex justify-center p-10">
	Are you sure you want to login as {data.userData.name}?
</section>
