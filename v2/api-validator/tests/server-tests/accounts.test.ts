import Client from '../../src/client';
import { Account, ApiError } from '../../src/client/generated';
import { isFoundInAccountDetails } from './account-validation';

describe('Accounts', () => {
  let client: Client;
  let accountsResponse: { accounts: Account[] };

  beforeAll(async () => {
    client = new Client();
    accountsResponse = await client.accounts.getAccounts({});
  });

  describe('/accounts', () => {
    it('should exclude balances in each account response by default', () => {
      for (const account of accountsResponse.accounts) {
        expect(account.balances).toBeUndefined();
      }
    });

    describe('With balances', () => {
      let balanceExcludedResponse: { accounts: Account[] };

      beforeAll(async () => {
        balanceExcludedResponse = await client.accounts.getAccounts({
          balances: true,
        });
      });

      it('should respond with accounts balances', () => {
        for (const account of balanceExcludedResponse.accounts) {
          expect(account.balances).toBeDefined();
        }
      });
    });

    describe('Interaction with /accounts/:accountId', () => {
      it('should find each account in response on account details endpoint', async () => {
        for (const account of accountsResponse.accounts) {
          const found = await isFoundInAccountDetails(account.id);
          expect(found).toBe(true);
        }
      });
    });
  });

  describe('/accounts/:accountId', () => {
    let accountId: string;

    beforeAll(() => {
      accountId = accountsResponse.accounts?.[0]?.id;
    });

    it('should have at least one account from accounts response', () => {
      expect(accountId).toBeDefined();
    });

    describe('Default request', () => {
      let accountDetailsWithBalances: Account;

      beforeAll(async () => {
        accountDetailsWithBalances = await client.accounts.getAccountDetails({
          accountId,
        });
      });

      it('should not have account balances in response', () => {
        expect(accountDetailsWithBalances.balances).toBeUndefined();
      });
    });

    describe('With balances', () => {
      let accountDetailsWithoutBalances: Account;

      beforeAll(async () => {
        accountDetailsWithoutBalances = await client.accounts.getAccountDetails({
          accountId,
          balances: true,
        });
      });

      it('should have account balances in response', () => {
        expect(accountDetailsWithoutBalances.balances).toBeDefined();
      });
    });
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
            const rateResponse = await client.accounts.getAccountRate({
              accountId,
              baseAsset: base,
              quoteAsset: quote,
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
          await client.accounts.getAccountRate({
            accountId: 'invalid-account-id',
            baseAsset: 'USD',
            quoteAsset: 'EUR',
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
