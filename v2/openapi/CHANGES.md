# Changelog

## 0.4.0 - 2024-01-08

### Breaking changes

- New capability `transfersInternal` was added to the `getCapabilities` endpoint. The new
  capability indicates account's ability to transfer funds to another sub-account/wallet of
  the same user. 
  This change does not affect the endpoints at `/accounts/{accountId}/transfers/withdrawals/subaccount`
  but adds a way to tell if the operations are supported.
- New required property `destinationPolicy` for internal transfer capabilities, when returned by
  `getWithdrawalMethods`. The policy property allows limiting transfers only to parent accounts.
- New required property `addressCreationPolicy` was added to the deposit capability object.
  the property allows servers to specify that it does not support creation of new deposit addresses
  for a given deposit capability. For example, in many cases there are deposit addresses for fiat
  deposits, but there is no option to create new fiat deposit addresses.
- Removed support for cryptocurrencies: CRO(Cronos), CSPR(Casper), IMX(Immutable), SNX(Synthetix).

### Non-breaking improvements

- Support for additional cryptocurrencies: ASTR, AURORA, AXL, BASE, BCH, BCHA, BITKUB, BSV, CANTO,
  CELESTIA, CHZ, CHZ2, CTXC, DASH, DYDX, EOS, ETHW, EVMOS, FLR, FTM, GLMR, HT, KAVA, KSM, LUNA, 
  LUNA2, MOVR, NEAR, OAS, OPT, OSMO, PALM, RON, RSK, SMR, SONGBIRD, SXNETWORK, TKX, VLX, WEMIX, 
  XDB, XDC, XEC, XEM, ZEC.
- New request error types: `deposit-address-creation-not-allowed`, `unsupported-transfer-method`,
  `transfer-destination-not-allowed`.
- Validation tool stability improvements.
  
-----
## 0.3.1 - 2023-11-21

### Non-breaking improvements

- Trading orders `quoteAssetQuantity` property was removed. From now clients will
  use only `baseAssetQuantity`. Servers should not return `quoteAssetQuantity` in their
  responses.
- Do not restrict IDs to be UUIDs — now any text could be an ID.
- Documentation improvements.

### Bug fixes

- Several fixes to tests that were sending requests to endpoints not supported in 
  server capabilities.
- Fixes to tests that were incorrectly reusing idempotency keys.
- Fixes to deposit address creation tests expecting wrong error responses. 

-----
## 0.3.0 - 2023-10-19

### Breaking changes

- Obligatory `side` property was added to `MarketEntry` object in the trading API.
- Trading order status `PARTIALLY_FILLED` was renamed to `EXPIRED`. Any order that was 
  not explicitly canceled user, but still stopped trading, should have the status 
  `EXPIRED`.

### Non-breaking improvements

- Orders list returned by `GET /accounts/{accountId}/trading/orders` was updated to not 
  require `trades` property. It is still required when requesting a single order details.
- `asset` property was removed from `MarketEntry` object in the trading API.

-----
## 0.2.0 - 2023-09-19

### New features

- It is now possible to specify historic fiat deposits and withdrawals that do not comply
  to any of the defined transfer methods. These transfers have the type `OtherFiat` and
  allow free text description and tag.

### Breaking changes

- Obligatory `id` property was added to `QuoteCapability` object in the liquidity API.

### Bug fixes

- Transfers between two sub-accounts of the same user cannot be listed as deposits 
  and consequently are not a valid transfer method for deposit address generation.
- In all the endpoints returning lists of withdrawals, the `withdrawals` property was 
  marked as required.

### Non-breaking improvements

- Optional property `subscriptions` was completely removed from the capabilities response.

-----
## 0.1.1 - 2023-08-03

### Non-breaking improvements

- Optional property `minWithdrawalAmount` was added to the withdrawal
  capabilities object.

-----
## 0.1.0 - 2023-08-02

### Semantically equivalent changes

These changes do not change the semantics of the API calls but nevertheless
introduce non backward compatible changes.

- All query parameters that had been defined as objects with multiple
  properties were changed to separate query parameters for each property. This
  change enables integration with a wider set of automatic tools.
- All operations that return an array were aligned to follow the same
  pattern - return an object with a mandatory property that contains the
  array.
- Obligatory `id` property was added to `AssetBalance` object.
- Obligatory `id` property was added to `MarketEntry` object, used to describe
  asks and bids in an order book.
- Trading order requests and response schemas were adjusted to define more
  strictly the possible combinations of properties.
- Cryptocurrency withdrawal and deposit schemas do not allow fiat currencies
  anymore.
- New boolean query parameter `balances` was added to
  `GET /accounts/{accountId}` and `GET /accounts`. It controls whether
  balances are returned together with the account details. By default,
  the balances are not required.
- Defined more strictly the structure of error responses.
- Expanded and adjusted the error types list.

### Non-breaking improvements

1. A unique operation ID was defined for each operation.
2. The various entity IDs are not forced to be UUIDs. 
3. Optional `description` property was added to `OrderBook` object.
4. More examples.

### Removed operations

1. `GET /capabilities/balances`  
   Clients should rely on `GET /accounts/{accountId}/balances` for the same
   functionality.
