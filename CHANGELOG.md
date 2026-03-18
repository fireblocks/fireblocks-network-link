# Changelog

All notable changes to this project will be documented in this file. Dates are displayed in UTC.

v0.5.1
9 March 2026

- ReferenceId in finalized states (Peer / Fiat / additional transfer methods): validation tests and documentation for non-empty `referenceId` on Get/Post withdrawals and deposits when the transfer method defines it.
- Blockchain transaction: on success, transaction hash (`blockchainTxId`) is required for blockchain withdrawals; validation tests and documentation added.
