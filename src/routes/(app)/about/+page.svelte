<script>
</script>

<div class="flex flex-col justify-center items-center h-full py-10 px:5 sm:px-10 text-white ">
	<h1 class="text-6xl">About the app</h1>
	<p class="text-2xl max-w-[600px]">
		This is a SvelteKit application that allows you to order food from restaurants, pay, and track your orders. It is written in TypeScript, and uses
		Amazon's DynamoDB as its database. Payments are implemented with Stripe. The app is deployed to Vercel, and the latest commit on master is
		accessible at prefood.miikat.dev. Features include:
	</p>
	<ul class="text-xl mt-5">
		<li>
			Create an account with
			<ul>
				<li>Google</li>
				<li>Github</li>
				<li>or just your email</li>
			</ul>
		</li>
		<li>
			Edit profile information
			<ul>
				<li>Upload your own photo</li>
				<li>Get a custom link to your profile</li>
				<li>Add API keys</li>
			</ul>
		</li>
		<li>
			Pay for items through Stripe
			<ul>
				<li>Use card no. 4242 4242 4242 4242 for testing</li>
			</ul>
		</li>
		<li>Get an email receipt and an order-specific link</li>
		<li>See the OpenAPI documentation at /docs (in development)</li>
		<li>Dark mode</li>
	</ul>
</div>

<style>
	ul li {
		list-style: circle;
		margin: 10px;
	}
	ul li ul {
		padding-left: 30px;
	}
</style>
