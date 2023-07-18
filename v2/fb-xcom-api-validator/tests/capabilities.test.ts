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

const requiredCapabilitiesComponents = ['accounts', 'balances'];

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

    describe('Component', () => {
      describe.each(requiredCapabilitiesComponents)('%s (required)', (componentName) => {
        it('should be listed in response', () => {
          expect(result.components[componentName]).toBeDefined();
        });

        it('should have a valid value', () => {
          expect(isValidComponentValue(result.components[componentName])).toBe(true);
        });
      });

      describe.each(optionalCapabilitiesComponents)('%s (optional)', (componentName) => {
        it('should have a valid value when listed in the response', () => {
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
