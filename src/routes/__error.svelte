<script context="module" lang="ts">
	import type { Load } from './__types';

	export const load: Load = ({ error, status }) => {
		return {
			props: {
				status,
				error: error?.message
			}
		};
	};
</script>

<script lang="ts">
	import Banner from '$lib/Banner.svelte';

	export let status: string;
	export let error: string;
</script>

<svelte:head>
	<title>{status} - pizzapp</title>
</svelte:head>

<Banner title={status} subtitle={error} />
