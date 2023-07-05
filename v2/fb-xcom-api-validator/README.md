# Fireblocks Partner Connectivity API Validator

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
npm run start:server:dev
```

In a separate shell:

```shell
npm run test
```


### Use your own server

```shell
SERVER="my-server-base-url" npm run test
```
