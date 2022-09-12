<script lang="ts">
	import { applyAction } from "$app/forms";
	import { invalidateAll } from "$app/navigation";
	import eye from "$lib/assets/eye.svg";
	import pen from "$lib/assets/pen.png";
	import { SCOPES, type Account } from "$lib/services/Account";
	import { uuid } from "$lib/util";
	import type { ActionData } from "./$types";

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

	function setToFlagMap(set: Set<string>) {
		return Object.fromEntries([...set.keys()].map((k) => [k, true]));
	}
	async function handleSubmit(this: HTMLFormElement, event: SubmitEvent) {
		scopeEditorOpen = false;
		const data = new FormData(this);
		if (data.get("key") === "undefined")
			data.set(
				"key",
				[...Object.keys(apiKeys ?? {})].length.toString().padStart(2, "0") + "_" + uuid()
			);
		if (
			[...data.keys()]
				.filter((k) => k !== "key")
				.sort()
				.join(" ") === [...Object.keys(scopeFlagMap)].join(" ")
		)
			return;

		const result: ActionData = await fetch(this.action, {
			method: "POST",
			body: data,
		}).then((res) => res.json());
		if (result.type === "success") await invalidateAll();
		applyAction(result);
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
{#if scopeEditorOpen}
	<form
		on:submit|preventDefault={handleSubmit}
		action={"?/savekey"}
		class="flex modal items-center justify-center"
	>
		<div class="bg-white relative p-5 flex flex-col gap-5 items-start">
			<button
				type="button"
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
							checked={attrs.required || scopeFlagMap[field + ":read"]}
							class:bg-transparent={attrs.required}
							class:bg-neutral-300={!attrs.required}
							class:pointer-events-none={attrs.required}
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
			<input class="hidden" name="key" value={currentlyEditing} />
			<div class="flex gap-3">
				<button class="cont" type="submit">Save key</button>
				<button hidden={!currentlyEditing} class="cont" formaction="?/deletekey" type="submit"
					>Delete key</button
				>
			</div>
		</div>
	</form>
{/if}
