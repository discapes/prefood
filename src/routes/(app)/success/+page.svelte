<script lang="ts">
	import Banner from "$lib/components/Banner.svelte";
	import { PUBLIC_APP_NAME } from "$env/static/public";
	import type { PageData } from "./$types";
	import { URLS } from "$lib/addresses";

	export let data: PageData;
</script>

<svelte:head>
	<title>Success - {PUBLIC_APP_NAME}</title>
</svelte:head>

<div class="flex flex-col items-center">
	<Banner title="SUCCESS" subtitle={undefined} />
	<div class="text-center text-2xl p-10 max-w-lg">
		Thank you for your purchase, {data.name}. Check it out in your <a class="underline" href={URLS.ORDERS}>orders</a>. A receipt has also been sent to {data.email}.
	</div>
</div>
