# Changelog

## TODO

- [-] allow changing profile info and authentication methods, and delete account
- [-] separate page endpoints and server endpoints, to make an api
  - [-] api keys for user
  - [-] use the passed fetch function
  - [-] generate api docs
- [ ] dont show errors
- [ ] username field
- [ ] link for each profile
- [ ] review code before update

- [ ] document and publish ddb utility library
- [ ] expiring session tokens
- [ ] oispaeliitti integration
- [ ] view where restaurant owners can see new orders and change their status
- [ ] secure restaurant add page
- [ ] serviceworker
  - [ ] web push API
    - [ ] notifications and page update on order status change for user
    - [ ] notifications and page update on new order for restaurant
  - [ ] on major update popup changelog, reload on close
    - [ ] on minor update reload on next visit
      - [ ] same thing with menu updates
  - [ ] server cache menu pages
- low priority
  - [ ] don't leak internal database data to even authenticated users
  - [ ] add titles for each page
  - [ ] human readable receipt
  - [ ] info page with link to my website
- [x] load user data in layout
- [x] svelte new cookies api
- [x] custom dynamodb wrapper
- [x] add css loadpath
- [x] more authentication options
  - [x] show linked identifications on account page
  - [x] GitHub authentication
  - [x] create account with email
  - [x] email sign in
  - [x] referer injection impossible, form for creating account is confirmed to belong to email
  - [x] remove google verify as request already comes from google
  - [x] cover edge cases
    - [x] can't link id method thats already linked to another account
      - [x] can't implicitly create account that would have an email already in use
- [x] security
  - [x] hash sessionTokens
  - [x] additional cookie security (SameSite, Secure, HttpOnly)
  - [x] make sure all sensitive endpoints POST if possible
    - SOP and SvelteKit prevent CSRF
  - [x] prevent login CSRF with double-submit cookie + state
  - [x] prevent XSS by not using @html
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
