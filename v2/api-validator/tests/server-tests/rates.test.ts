import { randomUUID } from 'crypto';
import Client from '../../src/client';
import { ApiError, BadRequestError } from '../../src/client/generated';
import { getAllCapableAccountIds, hasCapability } from '../utils/capable-accounts';

const noRatesCapability = !hasCapability('rates');
const accountIds = getAllCapableAccountIds('rates');

describe.skipIf(noRatesCapability)('Rates', () => {
  let client: Client;

  beforeAll(async () => {
    client = new Client();
  });

  describe('Get rate by account and assets', () => {
    const accountId = accountIds[0];

    if (!accountId) {
      it('should have at least one account with rates capability', () => {
        expect.fail('No accounts with rates capability found');
      });
      return;
    }

    describe('Successful rate retrieval', () => {
      it('should return rate for conversion pair ID', async () => {
        const conversionPairId = randomUUID();
        const response = await client.rates.getRateByAccountAndAssets({
          accountId,
          conversionPairId,
          rampsPairId: '',
          orderBookPairId: '',
        });

        expect(response).toHaveProperty('rate');
        expect(response).toHaveProperty('timestamp');
        expect(typeof response.rate).toBe('string');
        expect(typeof response.timestamp).toBe('number');
      });

      it('should return rate for ramps pair ID', async () => {
        const rampsPairId = randomUUID();
        const response = await client.rates.getRateByAccountAndAssets({
          accountId,
          conversionPairId: '',
          rampsPairId,
          orderBookPairId: '',
        });

        expect(response).toHaveProperty('rate');
        expect(response).toHaveProperty('timestamp');
        expect(typeof response.rate).toBe('string');
        expect(typeof response.timestamp).toBe('number');
      });

      it('should return rate for order book pair ID', async () => {
        const orderBookPairId = randomUUID();
        const response = await client.rates.getRateByAccountAndAssets({
          accountId,
          conversionPairId: '',
          rampsPairId: '',
          orderBookPairId,
        });

        expect(response).toHaveProperty('rate');
        expect(response).toHaveProperty('timestamp');
        expect(typeof response.rate).toBe('string');
        expect(typeof response.timestamp).toBe('number');
      });
    });

    describe('Error handling', () => {
      it('should fail when no pair ID is provided', async () => {
        try {
          await client.rates.getRateByAccountAndAssets({
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
