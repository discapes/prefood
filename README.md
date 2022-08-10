# pizzapp

This is a **SvelteKit** application that allows you to order food from restaurants, pay, and track your orders (TODO). It is written in **TypeScript**, and uses Amazon's **DynamoDB** as its database. You can checkout the schema in [SCHEMA.md](SCHEMA.md). Other features include user authentication and darkmode for now. Payments are implemented with **Stripe**. The app is deployed to **Vercel**, and the latest commit on master is accessible at [pizzapp.miikat.dev](https://pizzapp.miikat.dev). The name of this project is just a temporary placeholder. See the changelog in [CHANGELOG.md](CHANGELOG.md).

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
