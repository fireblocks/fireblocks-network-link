import Client from '../../src/client';
import { ApiComponents, ApiError, BadRequestError, Rate } from '../../src/client/generated';
import { getAllCapableAccountIds, hasCapability } from '../utils/capable-accounts';

const noRatesCapability = !hasCapability('rates');
const ratesAccountIds = getAllCapableAccountIds('rates');

/**
 * A rate can only be requested for a pair the account itself advertises, so the account
 * under test must support both `rates` and the component that exposes the pair IDs.
 */
function findRatesAccountSupporting(component: keyof ApiComponents): string | undefined {
  const capableAccountIds = new Set(getAllCapableAccountIds(component));
  return ratesAccountIds.find((accountId) => capableAccountIds.has(accountId));
}

const rampsAccountId = findRatesAccountSupporting('ramps');
const liquidityAccountId = findRatesAccountSupporting('liquidity');

function expectValidRate(rate: Rate): void {
  expect(rate).toHaveProperty('rate');
  expect(rate).toHaveProperty('timestamp');
  expect(typeof rate.rate).toBe('string');
  expect(typeof rate.timestamp).toBe('number');
}

describe.skipIf(noRatesCapability)('Rates', () => {
  let client: Client;

  beforeAll(async () => {
    client = new Client();
  });

  describe('Get rate by account and assets', () => {
    const accountId = ratesAccountIds[0];

    if (!accountId) {
      it('should have at least one account with rates capability', () => {
        expect.fail('No accounts with rates capability found');
      });
      return;
    }

    // Order book pairs are intentionally not covered: the API exposes no endpoint for
    // discovering order book pair IDs, so a supported one cannot be resolved for a provider.

    describe.skipIf(!rampsAccountId)('Ramps pair', () => {
      let rampsPairId: string;

      beforeAll(async () => {
        const { capabilities } = await client.capabilities.getRampMethods({
          accountId: rampsAccountId as string,
        });

        expect(capabilities.length).toBeGreaterThan(0);
        rampsPairId = capabilities[0].id;
      });

      it('should return rate for ramps pair ID', async () => {
        const response = await client.rates.getRateByAccountAndPairId({
          accountId: rampsAccountId as string,
          conversionPairId: '',
          rampsPairId,
          orderBookPairId: '',
        });

        expectValidRate(response);
      });
    });

    describe.skipIf(!liquidityAccountId)('Conversion pair', () => {
      let conversionPairId: string;

      beforeAll(async () => {
        const { capabilities } = await client.capabilities.getQuoteCapabilities({});

        expect(capabilities.length).toBeGreaterThan(0);
        conversionPairId = capabilities[0].id;
      });

      it('should return rate for conversion pair ID', async () => {
        const response = await client.rates.getRateByAccountAndPairId({
          accountId: liquidityAccountId as string,
          conversionPairId,
          rampsPairId: '',
          orderBookPairId: '',
        });

        expectValidRate(response);
      });
    });

    describe('Error handling', () => {
      it('should fail when no pair ID is provided', async () => {
        try {
          await client.rates.getRateByAccountAndPairId({
            accountId,
            conversionPairId: '',
            rampsPairId: '',
            orderBookPairId: '',
          });
          expect.fail('Expected to throw');
        } catch (err) {
          if (err instanceof ApiError) {
            expect(err.status).toBe(400);
            expect(err.body.errorType).toBe(BadRequestError.errorType.BAD_REQUEST);
          } else {
            throw err;
          }
        }
      });
    });
  });
});
