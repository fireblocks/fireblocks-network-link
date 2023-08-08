# Fireblocks Network Link v2 API Validator

This project contains the Fireblocks Network Link v2 API validation tool.
The tool is built to be executed as a stand-alone application that sends various
HTTP requests to the system under test to validate the correctness of the API
implementation.

## Prerequisites

- [nvm](https://github.com/nvm-sh/nvm)

## Quick start

Setup:

```shell
nvm install 18.14.2
nvm use
npm install
```

### Use the bundled mock server

Run the mock server:

```shell
npm run server
```

In a separate shell:

```shell
npm run test
```

The tests generate report files in the validation tool root directory in JSON and HTML formats.

### Use your own server

```shell
SERVER="my-server-base-url" npm run test
```

When testing your own server, you will usually need to configure the credentials of the user
connecting to the server and the request signing method the server uses. All these parameters
could be configured using the environment variables. Make a copy of `env.example`, rename it
to `.env` and edit the values. `src/config/index.ts` contains all the environment variable
definitions and the possible values.

### Configure withdrawal destinations

By default, withdrawal requests sent during testing will use random destinations.
If your server needs to work with specific destinations, you can set your own destiantions to
use.

Subaccount destination:

1. Open the project's .env file
2. Add a new line:
   ```shell
    WITHDRAWAL_SUB_ACCOUNT=
   ```
3. After the equal sign, enter the subaccount id to use for withdrawal destination

Peeraccount destination:

1. Open the project's .env file
2. Add a new line:
   ```shell
    WITHDRAWAL_PEER_ACCOUNT=
   ```
3. After the equal sign, enter the peeraccount id to use for withdrawal destination

Blockchain destination:

1. Open the project's .env file
2. Add these new lines:
   ```shell
     WITHDRAWAL_BLOCKCHAIN_ADDRESS=
     WITHDRAWAL_BLOCKCHAIN_ADDRESS_TAG=
   ```
   Note: address tag is optional
3. Enter the wanted values after the equal signs

Swift destination (for fiat withdrawals):

1. Open the project's .env file
2. Add these new lines:
   ```shell
    WITHDRAWAL_SWIFT_ACCOUNT_NAME=
    WITHDRAWAL_SWIFT_ACCOUNT_CITY=
    WITHDRAWAL_SWIFT_ACCOUNT_COUNTRY=
    WITHDRAWAL_SWIFT_ACCOUNT_SUBDIVISION=
    WITHDRAWAL_SWIFT_ACCOUNT_ADDRESS=
    WITHDRAWAL_SWIFT_ACCOUNT_POSTAL_CODE=
    WITHDRAWAL_SWIFT_CODE=
    WITHDRAWAL_SWIFT_ROUTING_NUMBER=
   ```
3. Enter the wanted values after the equal signs

Iban destination (for fiat withdrawals):

1. Open the project's .env file
2. Add these new lines:
   ```shell
    WITHDRAWAL_IBAN_ACCOUNT_NAME=
    WITHDRAWAL_IBAN_ACCOUNT_CITY=
    WITHDRAWAL_IBAN_ACCOUNT_COUNTRY=
    WITHDRAWAL_IBAN_ACCOUNT_SUBDIVISION=
    WITHDRAWAL_IBAN_ACCOUNT_ADDRESS=
    WITHDRAWAL_IBAN_ACCOUNT_POSTAL_CODE=
    WITHDRAWAL_IBAN_IBAN=
   ```
3. Enter the wanted values after the equal signs

## Design

- `src/config` contains the tool configuration.
  - The same configuration is used both by the server and the client.
  - Configuration values could be overridden either by editing the JSON files
    in the same directory or by setting environment variables.
- `src/server` contains the code of a web server fully implementing the API.
  - This is a mock implementation - the server doesn't do anything "real".
  - Any state is managed in-memory.
  - Values from the shared configuration in `src/config` are used to coordinate
    scenarios between the server and the client.
  - The official OpenAPI document, located in `../openapi` is used to
    validate the incoming requests and the outgoing responses.
- `src/client` contains the API client.
- `tests` contains the API validation tests.
  - The tests use the client in `src/client` to communicate with the server.
