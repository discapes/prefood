# PreFood

This is a **SvelteKit** application that allows you to order food from restaurants, pay, and track your orders (TODO). It is written in **TypeScript**, and uses Amazon's **DynamoDB** as its database. You can checkout the schema in [SCHEMA.md](SCHEMA.md). Other features include user authentication and darkmode for now. Payments are implemented with **Stripe**. The app is deployed to **Vercel**, and the latest commit on master is accessible at [prefood.miikat.dev](https://prefood.miikat.dev). The name of this project is just a temporary placeholder. See the changelog in [CHANGELOG.md](CHANGELOG.md).

## Architecture

### Login flow

---

1. The load function in `routes/(app)/+layout.server.ts` runs.
   - returns userData if authentication cookie is set
   - returns stateToken and makes sure it's cookie is set

---

2. `routes/(app)/+layout.svelte` renders the header and footer.
   - sets stateToken with Svelte's setContext
   - adds the `dark` class to `<body>` if localStorage has `darkMode`
   - adds a writable to the context that updates on darkMode toggle

---

3. `lib/components/Login.svelte` renders the login buttons.
   - In the `state` parameter to identity providers we pass:
     - if rememberMe is checked
     - whether we're logging in or just linking the identity to an account
     - what page the user came from
     - the method used, as they share the endpoint
     - the actual state token to prevent CSRF

---

4. The user gets redirected and `routes/(app)/account/login/server.ts` runs.
   - The used authentication method is read from the passed `state` parameter.
   - A `TrustedIdentity` (`googleID`, `githubID` or `email`) is read from the URL, verified and returned from `account/common.ts` along with a function that retrieves profile data.
     - If the trusted identity isn't already linked to an account, a new one is created.
   - A new session token is added to the user, and concatenated with the userID to form an `AuthToken` which is set into a cookie.
   - The user is redirected to where they were based on the `state` parameter.

---

### Order flow

Steps 1 and 2 from the login flow are the same.

---

3. User selects food items in `routes/(app)/restaurants/[slug]/+page.svelte`.

---

4. User is forwarded to `routes/(app)/checkout/+server.ts`, which parses the items, creates the Stripe checkout session and redirects the user to it.

---

5. Stripe calls `routes/(app)/checkout/+server.ts`, which adds the order to the database and sends a confirmation email.

## Developing

Once you've created a project and installed dependencies with `npm install` (or `pnpm install` (recommended) or `yarn`), start a development server:

```bash
npm run dev

# or start the server and open the app in a new browser tab
npm run dev -- --open
```

## Building

To create a production version of your app:

```bash
npm run build
```

You can preview the production build with `npm run preview`.

> To deploy your app, you may need to install an [adapter](https://kit.svelte.dev/docs/adapters) for your target environment.

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
    along with this program. .
