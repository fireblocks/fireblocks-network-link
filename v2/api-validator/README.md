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

When testing your own server, you will usually need to configure the withdrawal 
destinations, the credentials of the user connecting to the server and the request signing
method the server uses. All these parameters could be configured using environment 
variables. Make a copy of `env.example`, rename it to `.env` and edit the values.
`src/config/index.ts` contains all the environment variable definitions and the possible
values.

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

## Troubleshooting

If the tests fail catastrophically, it is possible to run the tests in three separate
groups:

1. Ensure you use Node.js v18.14.2
2. `npm run test:self` unit-tests validation tool's code. If these tests fail, there 
   is something wrong with the tool itself.
3. `npm run test:sanity` tests server functionality that is critical for the rest of 
   the tests. If these tests fail, there is either a configuration problem or the 
   server doesn't work properly. Usually, if these tests fail, most of the server 
   tests will fail too.
4. `npm run test:server` runs the rest of the tests. These tests assume the sanity 
   tests pass.
