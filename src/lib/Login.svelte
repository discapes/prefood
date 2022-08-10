<script context="module">
	export const prerender = true;
</script>

<script lang="ts">
	import { PUBLIC_GOOGLE_CLIENT_ID } from '$env/static/public';
	import { post } from '$lib/util';
	import { getContext, afterUpdate, onMount } from 'svelte';
	import type { Writable } from 'svelte/store';

	let rememberMe = true;
	let signInButton: HTMLElement;
	const darkmode: Writable<boolean | null> = getContext('darkmode');

	afterUpdate(renderButton);

	function renderButton() {
		if (window.google)
			google.accounts.id.renderButton(signInButton, {
				type: 'standard',
				theme: localStorage.getItem('darkmode') == 'true' ? 'filled_blue' : 'outline'
			});
	}

	function onSignIn(response: any) {
		post('/account/login', { tokenID: response.credential, rememberMe: rememberMe.toString() });
	}

	onMount(async () => {
		await loadGoogle();
		google.accounts.id.initialize({
			client_id: PUBLIC_GOOGLE_CLIENT_ID,
			callback: onSignIn
		});
		renderButton();
	});

	function loadGoogle(): Promise<void> {
		return new Promise((resolve, reject) => {
			const script = document.createElement('script');
			script.src = `https://accounts.google.com/gsi/client`;
			const headOrBody = document.head || document.body;
			headOrBody.appendChild(script);

			script.addEventListener('load', () => {
				if (window.google) {
					resolve();
				} else {
					reject(new Error('Google is not available'));
				}
			});

			script.addEventListener('error', () => {
				reject(new Error('Failed to load Google'));
			});
		});
	}
</script>

<div class="flex flex-col gap-10 items-center">
	<h1 class="mb-0">Sign in</h1>
	{#key $darkmode}
		<div class="h-[38px]" bind:this={signInButton} />
	{/key}

	<div class="flex gap-3 items-center">
		<label for="rememberMe">Remember me:</label>
		<input bind:checked={rememberMe} type="checkbox" class="bg-white/90 dark:bg-white/20 w-8 h-8 rounded-full" name="rememberMe" />
	</div>
</div>
