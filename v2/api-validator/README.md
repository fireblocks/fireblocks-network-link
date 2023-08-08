<center><img width="400px" src="logo.svg" alt="fireblocks-logo></center>

<br/>
<br/>
<center>
<h1>Fireblocks Network Link v2 API Validator</h1>
<ul>
    <li style="display:inline-block; margin: 0 10px;"> <a href="../openapi/fb-unified-openapi.yaml"> Network Link v2 API Specification </a></li>
    <li style="display:inline-block; margin: 0 10px;"> <a href="../openapi/fb-unified-openapi.yaml"> Fireblocks API Documentation </a></li>
</ul>
</center>

<br/>


## Intro

Fireblocks Network Link v2 API Validator is a specialized software tool created to assist third-party providers in ensuring the accuracy and proper functionality of the Application Programming Interface (API) they have developed. 

The primary purpose of this validation tool is to offer a comprehensive range of tests that thoroughly examine the API's implementation. The tool assesses whether the API operates correctly and adheres to the specified standards and requirements. By conducting these tests, partners can identify potential issues, bugs, or inconsistencies in their API. 

The Network Link v2 API Validator is designed as a standalone application, meaning it can be run independently of any other software. It functions by initiating HTTP requests to a server that has been configured for testing purposes. These requests are structured to simulate various scenarios and interactions that the API might encounter in real-world usage.

The validation process encompasses a series of tests that cover different aspects of the API's behavior. This could include tests to verify data input and output, proper handling of different HTTP methods, authentication and authorization mechanisms, error handling, and response times. By running these tests, partners can gain confidence that their API functions as intended and meets the expected standards of performance and security.

<br/>

## Prerequisites

- [Node Version Manager (nvm)](https://github.com/nvm-sh/nvm)

<br/>

## Setup

```js
nvm install 18.14.2
nvm use
npm install
```
<br/>

## Running tests

The main goal of the tool is to test your implementation of the Network Link v2 APIs. 
When testing your own server, you would need to configure the credentials of the user
connecting to the server and the request signing method the server uses. \
All these parameters could be configured using the environment variables. 

Make a copy of `env.example`, rename it 
to `.env` and edit the values. 

`src/config/index.ts` can be used as a reference as it contains all the environment variable
definitions and the possible values.

An example ```.env``` file would look like this:
```js
SERVER='https://my-server.example.com'
API_KEY='508a91a8-f1c1-4bac-aedb-2d241b1d406c'
SIGNING_PRIVATE_KEY= '-----BEGIN RSA PRIVATE KEY-----\nMIIEpQIBAAKCAQE...i94lF/aysGFRKIdVGbROLPT0=\n-----END RSA PRIVATE KEY-----\n'
SIGNING_PRE_ENCODING='base64'
SIGNING_ALGORITHM='ecdsa'
SIGNING_HASH_ALGORITHM='sha512'
SIGNING_POST_ENCODING='base64'
```

To execute the tests against your server, if the ```.env``` is set, run:
```js
npm run test
```

If not, run:
```js
SERVER="my-server-base-url" API_KEY="my-api-key" SIGNING_PRIVATE_KEY="my-signing-prv-key" npm run test
```

The following values are set by default:
```js
SIGNING_PRE_ENCODING='url-encoded'
SIGNING_ALGORITHM='rsa'
SIGNING_HASH_ALGORITHM='sha256'
SIGNING_POST_ENCODING='url-encoded'
```

The default values can be overridden by setting the ```production/development/test.json``` in ```./src/config``` directory. For example:
```js
{
  logging: {
    "level": "debug"
  },
  authentication: {
    apiKey: "my-api-key",
    signing: "-----BEGIN RSA PRIVATE KEY-----\nMIIEpQIBAAKCAQEAxjjIY3iOVBy3QTKhr0Ke6fx.../aysGFRKIdVGbROLPT0=\n-----END RSA PRIVATE KEY-----\n",
    preEncoding: "url-encoded",
    signingAlgorithm: "ecdsa",
    hashAlgorithm: "sha512",
    postEncoding: "base64"
  }
}
```
<br/>

## Run the bundled mock server


Fireblock Network Link v2 API Validator contains a mock server that you can run the tests on and examine the results.
To run the mock server:

```shell
npm run server
```

Then in a separate shell run:

```shell
npm run test
```

The tests generate report files in the validation tool root directory in JSON and HTML (```./test-results.html/json```) formats:

<div align="center">
    <img width="800px" heigth="400px" src="./tests-results.png" alt="mock-tests">
</div>

<br/>
<br/>

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
  - The official OpenAPI document, located in `../fb-xcom-openapi` is used to
    validate the incoming requests and the outgoing responses.
- `src/client` contains the API client.
- `tests` contains the API validation tests.
  - The tests use the client in `src/client` to communicate with the server.