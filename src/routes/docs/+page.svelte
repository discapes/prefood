<script lang="ts">
	import { onMount } from "svelte";
	import { SwaggerUIBundle } from "swagger-ui-dist";
	import "swagger-ui-dist/swagger-ui.css";

	let swaggerNode: HTMLDivElement;

	onMount(() => {
		SwaggerUIBundle({
			domNode: swaggerNode,
			url: "/swagger.json",
			presets: [SwaggerUIBundle.presets.apis, SwaggerUIBundle.SwaggerUIStandalonePreset],
		});
	});
</script>

<div bind:this={swaggerNode} />
