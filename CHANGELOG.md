# Changelog

## TODO

- next update

  - [ ] API support for all actions
  - [ ] dark mode improve
  - [ ] info page with link to my website
  - [ ] fix bug where if you click login too fast stateParameter isnt generated
  - [ ] update SCHEMA.md
  - [ ] prevent dos attacks by submitting large forms

- the next update

  - [ ] unit testing

- after that

  - [ ] api ratelimiting with aws memorydb
  - [ ] save connectionId to order mapping in order to remove them on disconnect?
    - or alternatively kick everyone on status update, and just have onclose() => invalidateAll and add new websocket
      - if we dont want to close the connection we can just ask everyone to respond in order to maintain their connection id as a listener

- additional tasks

  - [ ] m4m change amount
  - [ ] human readable receipt, don't include stripe data
  - [ ] expiring session tokens
  - [ ] secure restaurant edit page

---

- before 1.0

  - [ ] good test coverage
  - [ ] handle all errors on server
  - [ ] error logging and database audit logs
  - [ ] review code thoroughly
  - [ ] test and fix all features
  - [ ] update my goddamn resume
  - [ ] [community health files](https://docs.github.com/en/communities/setting-up-your-project-for-healthy-contributions/creating-a-default-community-health-file)
  - [ ] test ease of AWS deployment
    - CloudFormation template with Former2

- large

  - [ ] friend lists and instant messaging?
  - [ ] view where restaurant owners can see new orders and change their status
  - [ ] serviceworker
    - server notifications
      - Web push
        - custom?
        - google fcs?
        - onesignal?
      - pushpin
      - aws api gateway
    - [ ] notifications and page update on order status change for user
    - [ ] notifications and page update on new order for restaurant
    - [ ] on major update popup changelog, reload on close
      - [ ] on minor update reload on next visit
        - [ ] same thing with menu updates
    - [ ] server cache menu pages

- long term
  - [ ] [live streaming?](https://aws.amazon.com/solutions/implementations/live-streaming-on-aws/)
  - [ ] oispaeliitti integration?
  - [ ] publish dynamodb wrapper
  - [ ] separate authentication to a library

## [0.0.8] 2022-09-12

### Added

- **allow users to completely manage API keys and their scopes**
- **revoking other logins and deleting account**
- **username field**
- **own url for every profile**
- **separate database objects and client objects**
- account edit cancel button
- Sass includePaths
- titles for each page
- account operations to show alert on fail, fading dialog on success

### Fixed

- counter styles
- authentication (login and linking)
- restaurant button hitbox
- input validation for profile editing

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
