<script lang="ts">
	import type { PageData } from "./$types";

	export let data: PageData;
	$: user = data.user;
</script>

<div class="flex flex-col gap-3 items-center m-10">
	<div
		class="mb-2 h-40 w-40 rounded-full border-8 border-white overflow-hidden dark:border-neutral-700"
	>
		<img alt="profile" class="object-cover w-full h-full" src={user.picture} />
	</div>

	<h1>{user.username}</h1>
	<div class="grid grid-cols-[auto_auto] gap-x-3">
		<h2 class="text-right">Name:</h2>
		<h2 class="text-left font-bold inline">{user.name}</h2>
		<h2 class="text-right">Bio:</h2>
		<h2 class="text-left font-bold inline">{user.bio ?? ""}</h2>
	</div>
</div>

<style>
	h1,
	h2,
	h3 {
		margin: 0;
	}
</style>
