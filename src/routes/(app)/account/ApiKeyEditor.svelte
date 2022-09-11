<script lang="ts">
	import { SCOPES, type Account } from "$lib/services/Account";
	import eye from "$lib/assets/eye.svg";
	import { applyAction, enhance } from "$app/forms";
	import pen from "$lib/assets/pen.png";
	import { invalidateAll } from "$app/navigation";

	export let apiKeys: Account["apiKeys"];

	let showKeys = false;
	let scopeEditorOpen = false;
	let scopeFlagMap: Record<string, boolean> = {};
	let currentlyEditing: string | undefined;

	function editKey(key?: string) {
		if (!key) {
			currentlyEditing = undefined;
			scopeFlagMap = {};
		} else {
			currentlyEditing = key;
			scopeFlagMap = setToFlagMap(apiKeys![key]);
		}
		scopeEditorOpen = true;
	}
	function onSave() {
		scopeEditorOpen = false;
		invalidateAll();
	}

	function setToFlagMap(set: Set<string>) {
		return Object.fromEntries([...set.keys()].map((k) => [k, true]));
	}
</script>

<h2>API keys</h2>
{#if apiKeys}
	{#each Object.keys(apiKeys) as key}
		<div>
			<img
				on:click={() => (showKeys = !showKeys)}
				class="dark:invert cursor-pointer h-6 w-6 inline align-baseline mr-3"
				src={eye}
			/>
			{#if showKeys}
				<span>{key}</span>
			{:else}
				<span>{"~ ".repeat(key.length / 2)}</span>
			{/if}
			<img
				on:click={() => editKey(key)}
				class="dark:invert cursor-pointer h-6 w-6 inline align-baseline ml-3"
				src={pen}
			/>
		</div>
	{/each}
{/if}

<button class="cont" on:click={() => editKey()}>Add</button>
<form
	class:flex={scopeEditorOpen}
	use:enhance={() =>
		({ result }) => (applyAction(result), invalidateAll())}
	action={"?/savekey"}
	class="modal items-center justify-center"
>
	<div class="bg-white relative p-5 flex flex-col gap-5 items-start">
		<button
			on:click={() => (scopeEditorOpen = false)}
			class="absolute right-5 top-5 text-2xl leading-[15px]">&times;</button
		>
		<div
			class="inline-grid grid-cols-[auto_auto_auto] gap-3 gap-x-5 justify-items-center items-center"
		>
			<span>Read</span>
			<span>Write</span>
			<span>Field</span>
			{#each Object.entries(SCOPES.fields) as [field, attrs]}
				{#if attrs.read}
					<input
						type="checkbox"
						name={field + ":read"}
						checked={attrs.forced || scopeFlagMap[field + ":read"]}
						disabled={attrs.forced}
						class:bg-transparent={attrs.forced}
						class:bg-neutral-300={!attrs.forced}
						class="rounded-full w-8 h-8"
					/>
				{:else}&nbsp;{/if}
				{#if attrs.write}
					<input
						type="checkbox"
						checked={scopeFlagMap[field + ":write"]}
						name={field + ":write"}
						class="bg-neutral-300 rounded-full w-8 h-8"
					/>
				{:else}&nbsp;{/if}
				<div class="w-full">{field}</div>
			{/each}
		</div>
		Actions
		<div class="grid grid-cols-[auto_auto] gap-3 gap-x-5 justify-items-center items-center">
			{#each Object.entries(SCOPES.actions) as [action, description]}
				<input
					type="checkbox"
					checked={scopeFlagMap[action]}
					name={action}
					class="bg-neutral-300 rounded-full w-8 h-8"
				/>
				<div class="w-full">{description}</div>
			{/each}
		</div>
		<input type="hidden" name="key" value={currentlyEditing} />
		<button class="cont" on:click={onSave} type="submit">Save key</button>
	</div>
</form>
