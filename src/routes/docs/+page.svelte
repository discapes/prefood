<script lang="ts">
	import { disableScrollHandling } from "$app/navigation";
	import { onMount } from "svelte";
	import { SwaggerUIBundle } from "swagger-ui-dist";
	import "swagger-ui-dist/swagger-ui.css";

	let swaggerNode: HTMLDivElement;

	onMount(() => {
		disableScrollHandling();
		SwaggerUIBundle({
			domNode: swaggerNode,
			url: "/swagger.json",
			presets: [SwaggerUIBundle.presets.apis, SwaggerUIBundle.SwaggerUIStandalonePreset],
		});
	});
</script>

<div bind:this={swaggerNode} />
