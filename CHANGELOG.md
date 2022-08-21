# Changelog

## TODO

- [ ] more authentication options
  - [x] show linked identifications on account page
  - [ ] email authentication
  - [x] GitHub authentication
  - [ ] checkout state parameter and if its needed to prevent XSRF
  - [ ] allow changing profile info and authentication methods, and delete account
  - [ ] cover edge cases
    - [ ] user tries to link external account thats already linked to an internal account
    - [ ] make sure email is unique key
    - [ ] can't create account with email x if email x is already a key
- [ ] add titles for each page
- [ ] human readable receipt
- [ ] don't leak stripe data
- [ ] view where restaurant owners can change status of orders
- [ ] serviceworker
  - [ ] Web push API
    - [ ] notifications and page update when order status change for user
    - [ ] notifications and page update when order created for owner
  - [ ] on update popup changelog, reload on close
  - [ ] ssr pages: networkfirst, cache on client for an hour
- [ ] info page with link to my website
- [ ] add short cache on cdn (return cache headers on load())
- [x] limit sessionIDs for user
- [x] add Dependabot with pnpm lockfile updater
- [x] open repo to public
  - [x] squash commits
  - [x] add tags
  - [x] add readme
  - [x] add license and copyright
- [x] describe database schema in SCHEMA.md
- [x] stripe webhook
  - [x] send receipt
  - [x] create tracking page
  - [x] anonymous accounts
  - [x] save customerID
  - [x] create order from line_items

## [0.0.6] 2022-08-10

### Add

- types for serviceworker
- signing out removes sessionID on database
- changelog
- readme
- license

### Enhancements

- cleanup code and remove warnings from checks and linter

## [0.0.5] 2022-08-09 - 2c994c5

### Fixed

- darkmode to activate before first render
- Stripe loading to be more consistent
- Stripe checkout redirect URL

### Removed

- images from Flickr api (slow)
- restaurant slug field (slug is now just name)
- todos from SvelteKit template

### Changed

- DynamoDBClient to DynamoDBDocumentClient
  - removed dependency on util-dynamodb
- JavaScript code to TypeScript
  - set "strict" configuration back to true

### Added

- account page
- authentication with google
- "Remember me"-button
- types for database objects
- page for changing restaurant entries

### Enhancements

- mobile responsiveness
- miscellaneous animations

## [0.0.4] 2022-08-08 - d39c454

### Fixed

- payment screen not changing with dark mode

### Changed

- button to payment element with changeable amount

### Added

- buying items from menu page
  - Stripe checkout
  - show images from Flickr
- error page

### Enhancements

- polished user interface
- clean css files

## [0.0.3] 2022-08-07 - b5dbc80

### Changed

- node-sass to sass
- database from PostgreSQL to DynamoDB

### Added

- Stripe libraries
- payment button with Stripe checkout

### Enhancements

- cleaned unused code
- added formatting configuration for IDE and Prettier

## [0.0.2] 2022-08-06 - 6c6cc80

### Fixed

- pages with endpoints from being prerendered

### Added

- prefetch to links
- PostgreSQL connection timeout
- .gitignore

## [0.0.1] 2022-08-05 - 162b2c6

### Added

- PostgreSQL connection
- restaurant and menu pages
- TailwindCSS
