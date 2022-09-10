# Changelog

## TODO

- next update

  - [ ] username field
  - [ ] link for each profile
  - [ ] separate database objects and client objects
  - [ ] expand API
    - [ ] allow user to generate API keys with selected scopes
    - [ ] API Key support in all account operations

- before 1.0

  - [ ] handle all errors
  - [ ] review code before update
  - [ ] test and fix all features

- additional tasks

  - [ ] fix counter
  - [ ] add titles for each page
  - [ ] human readable receipt, don't include stripe data
  - [ ] info page with link to my website
  - [ ] expiring session tokens
  - [ ] secure restaurant add page
  - [ ] prevent dos attacks by submitting large forms

- large
- [ ] view where restaurant owners can see new orders and change their status
- [ ] serviceworker

  - [ ] web push API
    - [ ] notifications and page update on order status change for user
    - [ ] notifications and page update on new order for restaurant
  - [ ] on major update popup changelog, reload on close
    - [ ] on minor update reload on next visit
      - [ ] same thing with menu updates
  - [ ] server cache menu pages

- long term
  - [ ] oispaeliitti integration
  - [ ] publish dynamodb wrapper
  - [ ] separate authentication to a library

## [0.0.7] 2022-09-10

### Added

- authentication
  - GitHub authentication
  - email authentication
  - show linked identifications on account page
  - remove google verify as request already comes from google
  - cover edge cases
    - can't link auth method thats already linked to another account
      - can't implicitly create account with taken email
- stripe webhook
  - create order and add to database
  - send receipt to email
  - order tracking page
  - anonymous orders
  - save account payment details
- security

  - extracted stripe endpoint secret to environment variable
  - hash sessionTokens
  - additional cookie security (SameSite, Secure, HttpOnly)
  - make sure all sensitive endpoints POST if possible
    - SOP and SvelteKit prevent CSRF
  - prevent login CSRF with double-submit cookie and state
  - prevent XSS by not using @html

- account
  - allow changing profile info and authentication methods, and delete account
  - profile bio and picture
    - rotate image according to EXIF data
  - load user data in root layout
    - show profile pic in header
- API and docs with tsoa
- use new SvelteKit actions API
- use new cookies API
- custom dynamodb wrapper library
- add css import loadpath
- Dependabot with pnpm lockfile updater
- describe database schema in SCHEMA.md

## [0.0.6] 2022-08-10

### Added

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
