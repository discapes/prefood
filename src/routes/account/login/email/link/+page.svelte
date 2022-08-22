<script lang="ts">
	import type { PageData } from "./$types";

	export let data: PageData;
</script>

<svelte:head>
	<title>pizzapp</title>
</svelte:head>

<section class="flex justify-center p-10">
	{data.text}
</section>
