<script lang="ts">
	import { browser } from "$app/environment";
	import { enhance } from "$app/forms";
	import { PUBLIC_GATEWAY_ENDPOINT } from "$env/static/public";
	import { cli } from "$lib/util";
	import type { ActionData } from "./$types";

	let ws: WebSocket | null;
	export let form: ActionData | null;

	$: browser && form && console.log(form);

	function openWebsocket() {
		const nws = new WebSocket(`wss://${PUBLIC_GATEWAY_ENDPOINT}?asd=11d`);
		nws.onopen = (s) => {
			console.log("OPEN");
			ws = nws;
		};
		nws.onmessage = (m) => {
			console.log(":", m.data);
		};
		nws.onclose = (s) => {
			console.log("CLOSE");
			ws = null;
		};
	}
	function send(input: string) {
		console.log(">", input);
		ws!.send(input);
	}
</script>

<div class="h-screen flex gap-5 justify-center items-center">
	<form use:enhance={({ form }) => form.reset()} class="flex flex-col gap-3 p-3 bg-lime-400/50 rounded">
		Redis CLI
		<input class="cont" name="command" />
	</form>
	<div class="flex flex-col gap-3 p-3 bg-lime-400/50 rounded">
		WebSocket CLI
		<button class="cont" on:click={openWebsocket}>Open WebSocket</button>

		{#if ws}
			<input class="cont" use:cli={send} />
			<button class="cont" on:click={() => ws?.close()}>Close WebSocket</button>
		{/if}
	</div>
</div>

<style global lang="scss">
	@use "theme.css";
	@use "classes.scss";
</style>
