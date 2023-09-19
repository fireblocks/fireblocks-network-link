# Changelog

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

### Minor improvements

- Optional property `subscriptions` was completely removed from the capabilities response.

-----
## 0.1.1 - 2023-08-03

### Minor improvements

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

### Minor improvements

1. A unique operation ID was defined for each operation.
2. The various entity IDs are not forced to be UUIDs. 
3. Optional `description` property was added to `OrderBook` object.
4. More examples.

### Removed operations

1. `GET /capabilities/balances`  
   Clients should rely on `GET /accounts/{accountId}/balances` for the same
   functionality.
