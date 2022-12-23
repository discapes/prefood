<script>
	import { page } from "$app/stores";
	import Banner from "$lib/components/Banner.svelte";
</script>

<Banner title={$page.status} subtitle={$page.error?.message} />
