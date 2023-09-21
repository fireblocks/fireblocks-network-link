# Changelog

## 0.2.0 - 2023-09-21

- Supports only API version 0.2.0. See API changes log for more information.
- Tests were separated into three categories: server, sanity and self, to enable
  better failures troubleshooting. See README for detailed description.
- Capabilities configuration in the validation tool is not needed anymore.
  The tool reads the capabilities from the server and skips the tests of the
  unsupported components.
- Better tests coverage for withdrawals, deposits and trading orders.
