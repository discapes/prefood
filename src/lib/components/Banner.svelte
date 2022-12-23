<script lang="ts">
	export let title: unknown;
	export let subtitle: unknown;
</script>

<div class="relative m-10 mb-0 {!subtitle ? 'h-[200px]' : 'h-[300px]'}">
	<div class="container">
		<div class="glitch" data-text={title}>{title}</div>
		<div class="glow">{title}</div>
		{#if subtitle}
			<p class="subtitle">{subtitle}</p>
		{/if}
	</div>
</div>

<style lang="scss">
	@use "sass:math";

	.container {
		position: absolute;
		transform: translate(-50%, -50%);
		left: 50%;
		top: 100px;
		font-family: "Oswald", sans-serif;
		font-style: italic;
	}

	.glitch {
		color: dark-grey;
		position: relative;
		font-size: 20vh;
		// margin: 70px 200px;
		// animation: glitch 5s 5s infinite;
		animation: glitch-2 5s 5.02s infinite;
	}

	.glitch::before {
		content: attr(data-text);
		position: absolute;
		left: -2px;
		text-shadow: -5px 0 greenyellow;
		// background: rgb(255 228 230);
		overflow: hidden;
		top: 0;
		animation: noise-1 20s linear infinite alternate-reverse, glitch 5s 5.05s infinite;
	}

	:global(.dark) .glitch::before {
		text-shadow: -5px 0 magenta;
	}

	.glitch::after {
		content: attr(data-text);
		position: absolute;
		left: 2px;
		text-shadow: -5px 0 skyblue;
		// background: rgb(255 228 230);
		overflow: hidden;
		top: 0;
		animation: noise-2 20s linear infinite alternate-reverse, glitch 5s 5s infinite;
	}

	:global(.dark) .glitch::after {
		text-shadow: -5px 0 lightgreen;
	}

	// .glitch::after {
	//     background: rgb(12 74 110);
	// }

	// .glitch::before {
	//     background: rgb(12 74 110);
	// }

	// @keyframes glitch {
	//     1%{
	//       transform: rotateX(10deg) skewX(90deg);
	//     }
	//     2%{
	//       transform: rotateX(0deg) skewX(0deg);
	//     }
	//   }

	@keyframes noise-1 {
		$steps: 30;

		@for $i from 1 through $steps {
			#{percentage($i*math.div(1,$steps))} {
				$top: random(200);
				$bottom: random(201 - $top);
				clip-path: inset(#{$top}px 0 #{$bottom}px 0);
			}
		}
	}

	@keyframes noise-2 {
		$steps: 30;

		@for $i from 0 through $steps {
			#{percentage($i*math.div(1,$steps))} {
				$top: random(200);
				$bottom: random(201 - $top);
				clip-path: inset(#{$top}px 0 #{$bottom}px 0);
			}
		}
	}

	.scanlines {
		overflow: hidden;
		mix-blend-mode: difference;
	}

	.scanlines::before {
		content: "";
		position: absolute;
		width: 100%;
		height: 90%;
		top: 0;
		left: 0;

		background: repeating-linear-gradient(to bottom, transparent 0%, rgba(255, 255, 255, 0.05) 0.5%, transparent 1%);

		animation: fudge 7s ease-in-out alternate infinite;
	}

	@keyframes fudge {
		from {
			transform: translate(0px, 0px);
		}

		to {
			transform: translate(0px, 2%);
		}
	}

	.glow {
		@extend .glitch;
		text-shadow: 0 0 100px white;
		color: transparent;
		position: absolute;
		top: 0;
	}

	// :global(.dark) .glow {
	// 	text-shadow: 0 0 100px white;
	// }

	.subtitle {
		font-family: Arial, Helvetica, sans-serif;
		font-weight: 100;
		font-size: 2vh;
		color: dark-grey;
		text-transform: uppercase;
		letter-spacing: 1em;
		text-align: center;
		position: absolute;
		left: 17%;
		animation: glitch-2 5s 5.02s infinite;
	}

	@keyframes glitch-2 {
		1% {
			transform: rotateX(10deg) skewX(70deg);
		}

		2% {
			transform: rotateX(0deg) skewX(0deg);
		}
	}
</style>
