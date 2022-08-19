<script lang="ts">
	export let title: string;
	export let subtitle: string;
</script>

<div class="container">
	<div class="glitch" data-text={title}>{title}</div>
	<div class="glow">{title}</div>
	<p class="subtitle">{subtitle}</p>
</div>

<style lang="scss">
	@import "../banner.module.scss";
</style>
