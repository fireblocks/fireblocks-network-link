# Overview
[Fireblocks](https://fireblocks.com) connects businesses across the crypto world as the digital asset infrastructure for over 1,600 of the leading trading desks, hedge funds, brokerages, custodians, 3rd parties, and banks. To meet the demand of third-party services that want to access the liquidity of institutional investors and traders, Fireblocks is opening our platform for third-party solutions to quickly integrate into the Fireblocks platform. [Reach out to us for a partnership agreement](https://www.fireblocks.com/partners/#form-anchor) and add a Connector to have your product integrated.

## Benefits
*   Enhance your service's visibility and liquidity by immediately gaining access to 1000s of workspaces.
*   Fireblocks customers transact 20x more with 3rd parties supported on Fireblocks vs. unsupported 3rd parties
*   Deliver a better experience to your customers who use Fireblocks with greater control of how the Fireblocks platform interacts with your 3rd party.
*   Control rate limits and response codes
*   Manage the supported assets
*   Optimize the platform load for requests from Fireblocks

## How Fireblocks customers access 3rd parties
Fireblocks customers use the Fireblocks web-based console to connect their third-party accounts such as crypto 3rd partyie. This requires generating an API Key and an API Secret from their 3rd party portals, logging into their Fireblocks Console, adding an 3rd party account, selecting the 3rd party by a name and a logo, and then entering their account API Key, API Secret, and login details.

Once the third-party account is connected, Fireblocks customers can use the Fireblocks Console and API to:

*   View their 3rd party account balances for their main, sub, and various trading accounts
*   Withdraw and deposit funds between their connected 3rd party accounts, their Fireblocks Vault, and counterparties
*   Track the status of their withdrawals and deposits
*   View and audit their transaction history

## Getting Started to Official Launch
Contact your Fireblocks Sales Rep to list your 3rd party in the Fireblocks ecosystem. You will need to sign a licensing agreement for listing your 3rd party. Please note that an 3rd party listing license agreement is separate from a self-custody license agreement, and neither agreement is required to sign the other. Once signed, you will receive a test environment to connect and begin integrating your pending 3rd party integration.

Begin configuring inbound connections for the API endpoints described below. Fireblocks initiates calls to each of these endpoints under your base URL whenever a Fireblocks customer accesses your 3rd party using the Fireblocks integration. Once your contract is signed, the Fireblocks technical team will reach out to you to gather your 3rd party registration settings (see below).

Fireblocks starts each 3rd party integration with a short beta program. At a minimum, the beta participant will be yourself. Optionally, you may engage with your clients who already use Fireblocks for trading and self-custody to provide feedback on the beta program. Once the Fireblocks team determines the beta is successful, your 3rd party is made available to all Fireblocks customers, alongside mutual marketing activities to promote the launch.

## Register your 3rd party with Fireblocks
Once your license agreement for listing your 3rd party with Fireblocks is signed, the Fireblocks technical team will request the following 3rd party registration settings:

1.  Display name: i.e. “My Exchange” or “My Exchange Sandbox”
2.  Icon: a 32x32 .svg file
3.  Step-by-step guide for generating an API Key from your 3rd party platform. 
    -   A public link to your knowledge base is preferred (A sharable document or PDF is also acceptable).
4.  Base URL for your API endpoints: i.e. https://my-service.com/fireblocks
5.  Version: The Fireblocks Network Link major version number. Our current and only major version is 1.
6.  What is your main account's fundable type? (The account type where Fireblocks users can deposit and withdraw funds)
7.  Is 3rd party a sandbox environment: true or false
8.  Connection supports withdrawals from the 3rd party: true or false
9.  Connection supports deposits to the 3rd party: true or false
10.  Connection supports sub-accounts: true or false
11.  Connection supports sub-account to sub-account transfers: true or false
12.  What is your sub account's main fundable type? By default it is equal to the main account's fundable type.
13.  Does transferring assets to the 3rd party account require manually generating a deposit address on the 3rd party's portal?: true or false
14. Upon withdrawals, does your 3rd party require the "address" & "tag" field to be masked?: valid values are NONE, SHA512, SHA3\_256, SHA256. NONE is the default.
15.  Select your authentication preferences:
* HMAC:
    - Request encoding format: valid values are PLAIN, BASE64, HEXSTR, BASE58, BASE32
    - Request signing format: valid values are: SHA512, SHA3\_256, SHA256
    - Signature encoding result: valid values are PLAIN, BASE64, HEXSTR, BASE58, BASE32
* RSA:
    - Request encoding format: valid values are PLAIN, BASE64, HEXSTR, BASE58, BASE32
    - Request signing format: valid values are: SHA512, SHA3\_256, SHA256
    - Signature encoding result: valid values are PLAIN, BASE64, HEXSTR, BASE58, BASE32
* ECDSA:
    - Request encoding format: valid values are PLAIN, BASE64, HEXSTR, BASE58, BASE32
    - Request signing format: valid values are: SHA256
    - Signature encoding result: valid values are PLAIN, BASE64, HEXSTR, BASE58, BASE32
# Creating a Request
All REST requests will contain the following headers:

\*X-FBAPI-KEY\* The API key as a string.

\*X-FBAPI-SIGNATURE\* The payload signature output.

\*X-FBAPI-TIMESTAMP\* A timestamp of the request (in milliseconds)

\*X-FBAPI-NONCE\* A unique reference to the request (Random)

## Selecting a Timestamp
The X-FBAPI-TIMESTAMP header is the number of milliseconds since Unix Epoch in UTC. e.g. 1547015186532

The difference between the timestamp and the 3rd party time must be less than X seconds.

The amount of seconds (=X) is up to the 3rd party to decide - recommended to be a reasonable amount.

It's expected that the request on the 3rd party's end will be considered expired and rejected otherwise.

## Authentication Fundamentals
\[Authentication scheme is configurable: **HMAC**, **RSA**, **ECDSA**\]

### Using HMAC
The API-KEY and SECRET are **necessary**, and are generated and provided by the 3rd party.

Signature procedure:

1) Create a prehash string {timestamp+nonce+method+endpoint+body}.

2) Apply an encoding onto the prehash string (Pre-encoding is configurable: PLAIN, BASE64, HEXSTR, BASE58, BASE32)

\[The request body is a JSON string and need to be the same with the parameters passed by the API\]

3) Use SECRET to sign the string with HMAC (Internal hash function is configurable: SHA512, SHA3\_256, SHA256)

4) Apply an additional encoding onto the signature result (Post-encoding is configurable: PLAIN, BASE64, HEXSTR, BASE58, BASE32)

### Using RSA
Supported RSA Parameters [PKCS1v15]

The API-KEY and SECRET are **necessary**, and are generated and provided by the 3rd party.

SECRET is defined to be the Private RSA PEM.

Signature procedure on Fireblocks's end:

1) Create a prehash string {timestamp+nonce+method+endpoint+body}.

2) Apply an encoding onto the prehash string (Pre-encoding is configurable: PLAIN, BASE64, HEXSTR, BASE58, BASE32)

\[The request body is a JSON string and need to be the same with the parameters passed by the API\]

3) Use SECRET to sign the string with RSA (Internal hash function is configurable: SHA512, SHA3\_256, SHA256)

4) Apply an additional encoding onto the signature result (Post-encoding is configurable: PLAIN, BASE64, HEXSTR, BASE58, BASE32)

### Using ECDSA
Supported ECDSA Parameters [prime256v1/secp256k1]

The API-KEY and SECRET are **necessary**, and are generated and provided by the 3rd party.

SECRET is defined to be the Private ECDSA PEM. ECDSA result signature has an ASN1.DER format.

Signature procedure on Fireblocks's end:

1) Create a prehash string {timestamp+nonce+method+endpoint+body}.

2) Apply an encoding onto the prehash string (Pre-encoding is configurable: PLAIN, BASE64, HEXSTR, BASE58, BASE32)

\[The request body is a JSON string and need to be the same with the parameters passed by the API\]

3) Use SECRET to sign the string with ECDSA (Internal hash function is not configurable and is set to: SHA256)

4) Apply an additional encoding onto the signature result (Post-encoding is configurable: PLAIN, BASE64, HEXSTR, BASE58, BASE32)
## Request attributes
\- The timestamp in the signature payload is consistent with the X-FBAPI-TIMESTAMP field in the request header.

\- The body to be signed is consistent with the content of the request body.

\- The method is always UPPER CASE.

\- For GET requests, the endpoint in the signature payload contains the query string. e.g. /v1/depositAddress<b>?coinSymbol=ETH&...</b>

\- The endpoint in the signature payload is always in a path-relative format.

\- The endpoint in the signature payload could contain more paths, it's configurable. e.g. (DEFAULT) /v1/depositAddress, /fireblocks/v1/depositAddress...

\- The body is "" if there is no request body (for GET requests).

## Error responses
### Format
Upon failures, the expected format of the error is as follows:

> {"error": "Missing request header params", "errorCode": 400000}

"error" must be a string and is required.

"errorCode" must either be a number or null.

### Predefined error codes for HTTP response 400
<table>
<tr><p><td>Missing request header params</td><td>400000</td></p></tr>
<tr><p><td>Nonce sent was invalid</td><td>400001</td></p></tr>
<tr><p><td>Timestamp sent was invalid</td><td>400002</td></p></tr>
<tr><p><td>Signature sent was invalid</td><td>400003</td></p></tr>
<tr><p><td>Insufficient permissions for this API key</td><td>400004</td></p></tr>
<tr><p><td>Insufficient funds to carry out this operation</td><td>400005</td></p></tr>
<tr><p><td>Insufficient fee to carry out this operation</td><td>400006</td></p></tr>
<tr><p><td>Unsupported account type for this 3rd party</td><td>400007</td></p></tr>
<tr><p><td>Unsupported operation for this 3rd party</td><td>400008</td></p></tr>
<tr><p><td>Asset not supported on this 3rd party</td><td>400009</td></p></tr>
<tr><p><td>One of the parameters sent in the body or query is invalid</td><td>400010</td></p></tr>
<tr><p><td>Bad address format sent</td><td>400011</td></p></tr>
<tr><p><td>Balance amount is too small</td><td>400012</td></p></tr>
<tr><p><td>This 3rd party needs manual deposit address generation</td><td>400013</td></p></tr>
<tr><p><td>The 3rd party rejected this operation</td><td>400014</td></p></tr>
<tr><p><td>Withdraw was cancelled or failed on the 3rd party</td><td>400015</td></p></tr>
<tr><p><td>Address wasn't whitelisted</td><td>400016</td></p></tr>
<tr><p><td>IP wasn't whitelisted</td><td>400017</td></p></tr>
<tr><p><td>Account not found</td><td>400018</td></p></tr>
<tr><p><td>Withdrawals are limited by the 3rd party. Please try again in a bit.</td><td>400019</td></p></tr>
<tr><p><td>3rd party has denied the request - a settlement is required!</td><td>400020</td></p></tr>
</table>

_Note_ that not all error codes need to be in use!

# Changelog
All notable changes to this project will be documented in this file. Dates are displayed in UTC.

### v0.9.5
> 02 Dec 2023
* Added an optional direction param for the transaction history endpoint.

### v0.9.4
> 06 August 2023
* Supporting new networks Chiliz 2.0 and Flare.

### v0.9.3
> 17 July 2023
* Added isSettlementTx as a flag for the withdraw endpoint, for third party services that support off-exchange.

### v0.9.2
> 16 July 2023
* Withdrawal destination tag will be masked the same way the address is, if configured.

### v0.9.1
> 10 May 2023
* Changed the isGross and isSubTransfer documented type, from boolean to string.

### v0.9
> 13 March 2023
* Added ECDSA support in addition to HMAC/RSA support.

### v0.8.1
> 26 Feb 2023
* Supporting EthereumPoW and Luna Classic networks on Mainnet.

### v0.8.0
> 2 Feb 2023
* Added more details the RSA support.
* Added more details on the signature payload.
* Renamed to "Fireblocks Connector for Third Party Services"

> 29 Jan 2023
* Added RSA support in addition to HMAC support
* Withdrawal destination address can now become masked with a hash value, if configured.

### v0.7.5
> 29 Dec 2022
* Added credit balance instead of the borrow balance on /accounts endpoint
* Added new settlement error
* Can configure a different fundable account type for sub accounts
* Gas fees description added for isGross

### v0.7.4

> 18 Nov 2022
* Moved to Fireblocks Github repo
* Rename to Fireblocks Connector for Exchanges
