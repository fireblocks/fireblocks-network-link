Fireblocks Provider Connectivity API defines the interface for integration of third-party
providers into Fireblocks platform.

# Introduction

Fireblocks connects businesses across the crypto world as the digital asset infrastructure
for over 1,800 leading trading desks, hedge funds, brokerages, custodians, 3rd parties,
and banks. To meet the demand for third-party services that want to access the liquidity
of institutional investors and traders, Fireblocks is opening its platform for fast
third-party integration. Reach out to us for a partnership agreement and add a Connector
to have your product integrated.

## How Fireblocks customers access third-party accounts

Fireblocks customers use the Fireblocks web-based console to connect their Fireblocks
account to third-party solution providers. Fireblocks supports the integration of various
solution providers such as banks, cryptocurrency exchanges, and cryptocurrency on-ramp and
off-ramp services.

After a third-party account is connected, customers use the Fireblocks Console and
Fireblocks API to:

* View account balances for their primary, secondary, and trading accounts.
* Move funds between their accounts and their Fireblocks Vaults.
* Withdraw funds from and deposit funds to their accounts.
* Convert cryptocurrencies to and from fiat currencies (for on/off-ramping).
* Track the status of their withdrawals and deposits.
* View and audit their transaction history.

## How to register as a service provider?

Fireblocks gives you, as a partner, the ability to integrate your services and be
listed on Fireblocks platform as a bank or an exchange (including being registered as an
on/off-ramp provider). To be listed as a partner on Fireblocks platform, partners
implement the Fireblocks Connectivity API and register their services by contacting
Fireblocks support team.

# API Usage Guide

## IDs

The API uses textual properties to identify its resources. These properties are called
`id` when they identify the parent resource. ID property names that are prepended by
a resource name point to some other resource; for example, `assetId` or `accountId`.
The IDs must uniquely identify each resource. Other than that the API does not require
the IDs to have any specific structure.

## Idempotency

Servers implementing the API are expected to be
[idempotent](https://en.wikipedia.org/wiki/Idempotence). That is, a client should be able 
to safely retransmit the same request, being confident that the server will execute the
operation only once.

Request idempotence is achieved by adding `idempotencyKey` property to requests that
create or modify server resources. All retries of the same requests are sent containing 
the same unique idempotency key. Clients will never reuse an idempotency key for other
requests.

When a server encounters a request with a previously used idempotency key, it should act
as follows:

- If the original request is different from the new one, despite having the same
  idempotency key, the server should respond with HTTP status code 400 and response
  body containing a JSON object with the following properties:
  ```json
  {
    "message": "<Description of the error>",
    "errorType": "idempotency-key-reuse",
    "propertyName": "idempotencyKey",
    "requestPart": "body"
  }
  ```
- If the original request was handled with HTTP response status code 2xx or 4xx,
  the server should return exactly the same response with exactly the same status code.
- If the original request was handled with HTTP response status code 5xx,
  the server should handle the new request and consider the new response as the original 
  response when handling any consecutive retires.

Servers are expected to recognize a retry for 7 days, at least, since the last attempt.

## Capabilities

The API consists of separate optional components with flexible capabilities. Fireblocks
platform uses `/capabilities/*` endpoints to discovery dynamically the supported
components
and capabilities.

The discovery process starts with calling `GET /capabilities`. The response specifies
the implemented API version and an array of the supported API capabilities; for example,
this response indicates that all the capabilities are supported:

```json
{
  "version": "0.1.1",
  "components": {
    "accounts": "*",
    "balances": "*",
    "transfers": "*",
    "transfersBlockchain": "*",
    "transfersFiat": "*",
    "transfersPeerAccounts": "*",
    "trading": "*",
    "liquidity": "*"
  }
}
```

If a capability is supported only by a specific sub-account, the value of a capability
could
be replaced by a list of account IDs:

```json
{
  "version": "0.1.1",
  "components": {
    "accounts": "*",
    "balances": "*",
    "transfers": [
      "6cd2fe1e-d0bc-4fad-a9ba-9384e0fdfdc0",
      "7885a47b-0719-4448-b59e-3b8497cd1685"
    ]
  }
}
```

Based on the response, Fireblocks platform will use the endpoints specific to each
component to discover the specific capabilities for each component.

## Mandatory endpoints

All the capability, accounts, and balances endpoints must be always implemented, for all
the users and all their accounts. These endpoints are:

- `GET /capabilities`
- `GET /capabilities/assets`
- `GET /capabilities/assets/{id}`
- `GET /accounts`
- `GET /accounts/{accountId}`
- `GET /accounts/{accountId}/balances`

## Security

To ensure secure communication the protocol specifies several HTTP headers that must be
sent with each HTTP request:

- `X-FBAPI-KEY` - a secret token used to identify and authenticate the API caller.
- `X-FBAPI-TIMESTAMP` - request creation UTC time, expressed in milliseconds since Unix
  Epoch.
- `X-FBAPI-NONCE` - request universal unique identifier (UUID).
- `X-FBAPI-SIGNATURE` – request cryptographic signature.

### Signature

HTTP request signature is calculated by applying a sequence of operations to the request
data.

#### Building the message to sign

Build the message by concatenating the following parts of the request in this specific
order:

1. Timestamp — the request timestamp as it appears in `X-FBAPI-TIMESTAMP` header;
2. Nonce — the request nonce as it appears in `X-FBAPI-NONCE` header;
3. Method — the HTTP method of the request in upper case;
4. Endpoint — the request URL, including the query string, without prefixes;
5. Request body — the body of the HTTP request, when exists.

For example, let's assume a client decides to get the first two balances of the account
with ID `A1234`. These are the request properties:

| Property     | Value                                      |
|--------------|--------------------------------------------|
| Timestamp    | `1691606624184` (2023-08-09T18:43:44.184Z) |
| Nonce        | `c3d5f400-0e7e-4f94-a199-44b8cc7b6b81`     |
| Method       | `GET`                                      |
| Endpoint     | `/accounts/A1234/balances&limit=2`         |
| Request body | no request body for this request           |

The message to sign will
be: `1691606624184c3d5f400-0e7e-4f94-a199-44b8cc7b6b81GET/accounts/A1234/balances&limit=2`

#### Computing the signature

The signature is computed by applying a pre-encoding function, a signing algorithm and
a post-encoding function to the message. A server can implement one of the several
supported options and specify the choice during the on-boarding process. The same 
signing method will be used for all the requests.

These are the supported algorithms:

Pre- and post-encoding:

- URL encoded
- Base64
- HexStr
- Base58
- Base32

Signing algorithms and possible hash functions:

- HMAC (SHA512, SHA3_256, or SHA256)
- RSA PKCS1v15 (SHA512, SHA3_256, or SHA256)
- ECDSA prime256v1/secp256k1 (SHA256 only)

## Assets and transfer methods

An asset in Fireblocks Connectivity API is either a national currency (
per [ISO-4217](https://en.wikipedia.org/wiki/ISO_4217)), one
of the blockchain native cryptocurrencies, explicitly listed in the API specification, or
an arbitrary blockchain token. A provider can choose to support test
versions of assets by setting testAsset flag in the capabilities response.

Any token used anywhere in the API must be listed in the response to `GET
/capabilities/assets`. The returned object assigns a unique ID to each token. When an
asset
is used in a request or a response it is identified by its code/symbol, if it is an asset
predefined by the API specification; otherwise, it is identified by the aforementioned
unique ID.

> National currencies and blockchain native currencies (e.g., BTC and ETH) can be
> specified without listing them in `/capabilities/assets`.

Transfer methods define how assets are withdrawn and deposited. Each transfer method
starts as a capability. Given a capability, it can be used to define transfer addresses.
Finally, an address is used to make an actual transfer.

For example, calling `GET /capabilities/transfers/withdrawals` could return the following
object:

```json
[
  {
    "balanceAsset": {
      "coinType": "NationalCurrency",
      "currencyCode": "USD"
    },
    "capability": {
      "transferMethod": "PublicBlockchain",
      "blockchain": "Ethereum",
      "asset": {
        "assetId": "a36c6daa-8ce9-4fd5-9b1d-5c33901a08e9"
      }
    }
  }
]
```

And `GET /capabilities/assets` return

```json
[
  {
    "id": "a36c6daa-8ce9-4fd5-9b1d-5c33901a08e9",
    "name": "Tether USD",
    "symbol": "USDT",
    "type": "Erc20Token",
    "decimalPlaces": 6,
    "blockchain": "Ethereum",
    "decimalPlaces": 6,
    "contractAddress": "0xdAC17F958D2ee523a2206206994597C13D831ec7"
  }
]
```

Combining the two responses together allows the client to understand that the server
supports withdrawal of USD balances as USDT over Ethereum blockchain.

In the next step, this capability could be used to define a specific withdrawal
destination:

```json
{
  "transferMethod": "PublicBlockchain",
  "blockchain": "Ethereum",
  "asset": {
    "assetId": "a36c6daa-8ce9-4fd5-9b1d-5c33901a08e9"
  },
  "amount": "10",
  "address": "0xEC52EC04b660a15B6C7A7C8C85f102B2C6cb2697",
  "blockchainTxId": "0xb3b773aaf5929b2f94db973da8bb6f31b334cc57eaef872bd927119946067843"
}

```

Notice, that in a deposit or a withdrawal operation the operation asset and the balance
asset are specified separately, thus enabling scenarios when assets appear as different
currencies when they "move".

Moreover, it is possible to define balances as arbitrary buckets, as long as there is a
clear definition which assets can be deposited and withdrawn from the bucket.

The same principles apply to fiat transfers. In general, asset transitions could be
described as follows:

```
    ┌───────────┐    ┌───────────┐    ┌──────────────┐    ┌───────────┐    ┌──────────────┐
    │  Deposit  │    │  Balance  │    │              │    │  Balance  │    │  Withdrawal  │
    │           ├───►│           ├───►│  Conversion  ├───►│           ├───►│              │
    │  Asset 1  │    │  Asset 2  │    │              │    │  Asset 3  │    │   Asset 4    │
    └───────────┘    └───────────┘    └──────────────┘    └───────────┘    └──────────────┘
Example: MXN              MXN                                  USD               USDC
```
