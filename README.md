# PreFood

This is a **SvelteKit** application that allows you to order food from restaurants, pay, and track your orders. It is written in **TypeScript**, and uses
Amazon's **DynamoDB** as its database. Payments are implemented with **Stripe**. The app is deployed to **Vercel**, and the latest commit on master is
accessible at [prefood.miikat.dev](https://prefood.miikat.dev). See the changelog and TODO list in [CHANGELOG.md](CHANGELOG.md).

## Features

- Create an account with
  - Google
  - Github
  - or just your email
- Edit profile information
  - Upload your own photo
  - Get a custom link to your profile
  - Add API keys
- Pay for items through Stripe
  - Use card no. 4242 4242 4242 4242 for testing
- Get an email receipt and an order-specific link
- See the OpenAPI documentation at /docs (in development)
- Dark mode

## Architecture

### Login flow

1. The load function in `routes/(app)/+layout.server.ts` runs.

   - Loads the user's data if they're authenticated
   - Generates a state token and makes sure it's also set as a cookie

2. `routes/(app)/+layout.svelte` renders the header and footer.

   - Adds the state token to the context
   - Adds the `dark` class to `<body>` if localStorage has `darkMode`

3. `lib/components/Login.svelte` renders the login buttons.

   - In the `state` parameter to identity providers we pass:
     - If rememberMe is checked
     - Whether we're logging in or linking the identity to an existing account
     - What page the user came from
     - The authentication method used
     - The state token to prevent CSRF

4. The user gets redirected and `routes/(app)/account/login/server.ts` runs.
   - The used authentication method is read from the passed `state` parameter.
   - A trusted identity (`googleID`, `githubID` or `email`) is read from the URL and verified.
   - A new session token is generated and added to the user's account.
   - The session token is concatenated with the userID to form an `AuthToken` which is set into a cookie.
   - The user is redirected to where they were based on the `state` parameter.

---

### Order flow

Steps 1 and 2 from the login flow are the same.

3. User selects food items in `routes/(app)/restaurants/[slug]/+page.svelte` and triggers a SvelteKit action in `+page.server.ts`;

   - The items selected are parsed and checked that they correspond to actual menu items
   - A Stripe checkout session is created and the user is redirected to it

4. Stripe's server calls `/routes/api/stripe-webhook/+server.ts`, which adds the order to the database and emails a receipt.

5. The user is redirected to `/orders`, and their orders are displayed from the database

---

### DynamoDB schema

- There's three different tables: `users`, `restaurants` and `prders`.
- (pk) = primary key
- (sk) = sort key
- (si) = there's a secondary index with an `-index` suffix

#### `users`

| userID (pk) | googleID (si) | githubID (si) | email (si) | name   | username | picture             | sessionTokens | stripeCustomerID | apiKeys                        |
| ----------- | ------------- | ------------- | ---------- | ------ | -------- | ------------------- | ------------- | ---------------- | ------------------------------ |
| string      | string?       | string?       | string     | string | string   | string / Uint8Array | Set\<string>  | string?          | Record\<string, Set\<string>>? |

#### `restaurants`

| name (pk) | menu       | reviews | stars  |
| --------- | ---------- | ------- | ------ |
| string    | MenuItem[] | number  | number |

#### `orders`

| userID (pk) | timestamp (sk) | restaurantName | items             | status |
| ----------- | -------------- | -------------- | ----------------- | ------ |
| string      | number         | string         | Stripe.LineItem[] | string |

## Development

1. Clone the project and install dependencies with `pnpm install` or `npm install`.
2. Create a .env file by copying and modifying .env.example
3. Run `pnpm run dev` and visit `http://localhost:5173`

## Deployment

This app is best deployed on serverless providers like Vercel, but it can also be run with node.js.

Read more [here](https://kit.svelte.dev/docs/adapters#supported-environments-node-js).

## License

[AGPL-3.0-or-later](LICENSE.txt):

    Copyright (C) 2022 Miika Tuominen

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU Affero General Public License as published
    by the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU Affero General Public License for more details.

    You should have received a copy of the GNU Affero General Public License
    along with this program.
