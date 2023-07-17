import Client from '../src/client';
import { Capabilities } from '../src/client/generated';

const optionalCapabilitiesComponents = [
  'historicBalances',
  'transfers',
  'transfersBlockchain',
  'transfersFiat',
  'transfersPeerAccounts',
  'trading',
  'liquidity',
  'subscriptions',
];

describe('Capabilities', () => {
  describe('/capabilities', () => {
    let result: Capabilities;

    beforeAll(async () => {
      const client = new Client();
      result = (await client.capabilities.getCapabilities({})) as Capabilities;
    });

    it('should include a valid api version', () => {
      expect(isValidApiVersion(result.version)).toBe(true);
    });

    describe('Components', () => {
      it('should contain accounts and balances (required components)', () => {
        expect(result.components.accounts).toBeDefined();
        expect(result.components.balances).toBeDefined();
      });

      describe.each(optionalCapabilitiesComponents)('%s', (componentName) => {
        it('should have wildcard value or an array of identifiers when component is returned', () => {
          expect(isValidComponentValue(result.components[componentName])).toBe(true);
        });
      });
    });
  });
});

function isValidApiVersion(value: string) {
  const apiVersionRegex = /^\d+\.\d+\.\d+$/;
  return apiVersionRegex.test(value);
}

function isStringArray(value: unknown) {
  if (!Array.isArray(value)) {
    return false;
  }

  if (value.find((item) => typeof item !== 'string')) {
    return false;
  }

  return true;
}

function isValidComponentValue(value: unknown) {
  if (value === undefined) {
    return true;
  }

  if (value === '*' || isStringArray(value)) {
    return true;
  }

  return false;
}
