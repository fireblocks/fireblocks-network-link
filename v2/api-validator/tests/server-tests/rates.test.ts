import Client from '../../src/client';
import { Account, ApiError } from '../../src/client/generated';

describe('Rates', () => {
  let client: Client;
  let accountsResponse: { accounts: Account[] };

  beforeAll(async () => {
    client = new Client();
    accountsResponse = await client.accounts.getAccounts({});
  });
  describe('/accounts/:accountId/rate', () => {
    let accountId: string;

    beforeAll(() => {
      accountId = accountsResponse.accounts?.[0]?.id;
    });

    describe('Valid requests', () => {
      const validAssetCombinations = [
        { base: 'USD', quote: 'EUR', description: 'fiat to fiat' },
        { base: 'BTC', quote: 'ETH', description: 'cryptocurrency to cryptocurrency' },
        { base: 'USD', quote: 'BTC', description: 'fiat to cryptocurrency' },
        { base: 'USD', quote: 'USD', description: 'same asset' },
      ];

      describe.each(validAssetCombinations)('$description ($base to $quote)', ({ base, quote }) => {
        it('should return valid exchange rate', async () => {
          try {
            const rateResponse = await client.rates.getAccountRate({
              accountId,
              baseAsset: base,
              quoteAsset: quote,
              isTest: false,
            });

            // Validate response structure
            expect(rateResponse.rate).toBeDefined();
            expect(typeof rateResponse.rate).toBe('string');

            expect(rateResponse.baseAsset).toBeDefined();
            expect(typeof rateResponse.baseAsset).toBe('object');

            expect(rateResponse.quoteAsset).toBeDefined();
            expect(typeof rateResponse.quoteAsset).toBe('object');

            // Validate asset references match requested assets
            if ('assetId' in rateResponse.baseAsset) {
              expect(rateResponse.baseAsset.assetId).toBe(base);
            } else if ('nationalCurrencyCode' in rateResponse.baseAsset) {
              expect(rateResponse.baseAsset.nationalCurrencyCode).toBe(base);
            }

            if ('assetId' in rateResponse.quoteAsset) {
              expect(rateResponse.quoteAsset.assetId).toBe(quote);
            } else if ('nationalCurrencyCode' in rateResponse.quoteAsset) {
              expect(rateResponse.quoteAsset.nationalCurrencyCode).toBe(quote);
            }
          } catch (error) {
            console.error(`Rate validation error for ${base} to ${quote}:`, error);
            throw error;
          }
        });
      });
    });

    describe('Error cases', () => {
      it('should return 404 error for invalid account ID', async () => {
        try {
          await client.rates.getAccountRate({
            accountId: 'invalid-account-id',
            baseAsset: 'USD',
            quoteAsset: 'EUR',
            isTest: false,
          });
          throw new Error('Expected to throw');
        } catch (error) {
          if (error instanceof ApiError) {
            expect(error.status).toBe(404);
          } else {
            throw error;
          }
        }
      });
    });
  });
});
