<script>
	function handler() {
		const ws = new WebSocket("wss://ia1rfsectb.execute-api.eu-north-1.amazonaws.com/test?asd=11d");
		ws.onopen = (s) => {
			// ws.close(1000, "asdads");
		};
	}
</script>

<div class="h-screen flex justify-center items-center">
	<button class="cont" on:click={handler}>Test</button>
	<!-- <Counter /> -->
</div>

<style global lang="scss">
	@use "theme.css";
	@use "classes.scss";
</style>
