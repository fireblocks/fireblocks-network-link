import { randomUUID } from 'crypto';
import Client from '../../src/client';
import { hasCapability } from '../utils/capable-accounts';
import { Pageable, paginated } from '../utils/pagination';
import { AssetsDirectory } from '../utils/assets-directory';
import {
  Account,
  ApiError,
  AssetBalance,
  AssetReference,
  BadRequestError,
  Balances,
  CryptocurrencySymbol,
  NationalCurrencyCode,
  RequestPart,
} from '../../src/client/generated';

const noHistoricBalancesCapability = !hasCapability('historicBalances');

const invalidAssetParamsCombinations = [
  {
    nationalCurrencyCode: NationalCurrencyCode.USD,
    cryptocurrencySymbol: CryptocurrencySymbol.ETH,
  },
  {
    assetId: 'any-value-works',
    cryptocurrencySymbol: CryptocurrencySymbol.ETH,
  },
  {
    assetId: 'any-value-works',
    nationalCurrencyCode: NationalCurrencyCode.USD,
  },
  {
    assetId: 'any-value-works',
    nationalCurrencyCode: NationalCurrencyCode.USD,
    cryptocurrencySymbol: CryptocurrencySymbol.ETH,
  },
];

describe('Balances', () => {
  let client: Client;
  let assets: AssetsDirectory;
  const accounts: Account[] = [];
  let isKnownAsset: (asset: AssetReference) => boolean;

  const getAccounts: Pageable<Account> = async (limit, startingAfter?) => {
    const response = await client.accounts.getAccounts({ limit, startingAfter });
    return response.accounts;
  };

  beforeAll(async () => {
    client = new Client();
    assets = await AssetsDirectory.fetch();
    for await (const account of paginated(getAccounts)) {
      accounts.push(account);
    }
    isKnownAsset = assets.isKnownAsset.bind(assets);
  });

  describe('List balances', () => {
    let accountBalancesMap: Map<string, Balances>;

    const getAccountBalancesMap = async (accounts: Account[]): Promise<Map<string, Balances>> => {
      const client = new Client();
      const accountBalancesMap = new Map<string, Balances>();
      for (const account of accounts) {
        const balances: Balances = [];

        const getBalances: Pageable<AssetBalance> = async (limit, startingAfter?) => {
          const response = await client.balances.getBalances({
            accountId: account.id,
            limit,
            startingAfter,
          });
          return response.balances;
        };

        for await (const balance of paginated(getBalances)) {
          balances.push(balance);
        }

        accountBalancesMap.set(account.id, balances);
      }

      return accountBalancesMap;
    };

    const getFailedBalancesResult = async (
      accountId: string,
      assetId?: string,
      nationalCurrencyCode?: NationalCurrencyCode,
      cryptocurrencySymbol?: CryptocurrencySymbol
    ): Promise<ApiError> => {
      try {
        await client.balances.getBalances({
          accountId,
          assetId,
          nationalCurrencyCode,
          cryptocurrencySymbol,
        });
      } catch (err) {
        if (err instanceof ApiError) {
          return err;
        }
        throw err;
      }
      throw new Error('Expected to throw');
    };

    beforeAll(async () => {
      accountBalancesMap = await getAccountBalancesMap(accounts);
    });

    it('should receive at least one asset balance per account', () => {
      for (const [accountId, accountBalances] of accountBalancesMap.entries()) {
        expect(
          accountBalances.length,
          `received empty balance list for account ${accountId}`
        ).toBeGreaterThan(0);
      }
    });

    it('should return only known assets in balances', () => {
      for (const [accountId, balances] of accountBalancesMap.entries()) {
        for (const balance of balances) {
          expect(balance.asset, `unknown asset received for account ${accountId}`).toSatisfy(
            isKnownAsset
          );
        }
      }
    });

    describe('Asset query params', () => {
      it('should fail when using an unknown assetId', async () => {
        for (const accountId of accountBalancesMap.keys()) {
          const error = await getFailedBalancesResult(accountId, randomUUID());
          expect(error.status).toBe(400);
          expect(error.body.errorType).toBe(BadRequestError.errorType.UNKNOWN_ASSET);
          expect(error.body.requestPart).toBe(RequestPart.QUERYSTRING);
        }
      });

      it.each(invalidAssetParamsCombinations)(
        'should fail when more than one of the query params is defined',
        async ({ assetId, nationalCurrencyCode, cryptocurrencySymbol }) => {
          for (const accountId of accountBalancesMap.keys()) {
            const error = await getFailedBalancesResult(
              accountId,
              assetId,
              nationalCurrencyCode,
              cryptocurrencySymbol
            );
            expect(error.status).toBe(400);
            expect(error.body.errorType).toBe(BadRequestError.errorType.SCHEMA_ERROR);
            expect(error.body.requestPart).toBe(RequestPart.QUERYSTRING);
          }
        }
      );

      it('should return single item when asset is specified in query', async () => {
        for (const [accountId, balances] of accountBalancesMap.entries()) {
          for (const { asset } of balances) {
            const { balances } = await client.balances.getBalances({
              accountId,
              ...asset,
            });

            expect(balances.length).toBe(1);
            expect(balances[0].asset).toEqual(asset);
            return;
          }
        }
      });
    });
  });

  describe.skipIf(noHistoricBalancesCapability)('List historic balances', () => {
    let accountBalancesMap: Map<string, Balances>;
    const time = new Date(Date.now()).toISOString();

    const getAccountHistoricBalancesMap = async (
      accounts: Account[]
    ): Promise<Map<string, Balances>> => {
      const client = new Client();
      const accountBalancesMap = new Map<string, Balances>();
      for (const account of accounts) {
        const historicBalances: Balances = [];

        const getHistoricBalances: Pageable<AssetBalance> = async (limit, startingAfter?) => {
          const response = await client.historicBalances.getHistoricBalances({
            time,
            accountId: account.id,
            limit,
            startingAfter,
          });
          return response.balances;
        };

        for await (const balance of paginated(getHistoricBalances)) {
          historicBalances.push(balance);
        }

        accountBalancesMap.set(account.id, historicBalances);
      }

      return accountBalancesMap;
    };

    const getFailedHistoricBalancesResult = async (
      accountId: string,
      assetId?: string,
      nationalCurrencyCode?: NationalCurrencyCode,
      cryptocurrencySymbol?: CryptocurrencySymbol
    ): Promise<ApiError> => {
      try {
        await client.historicBalances.getHistoricBalances({
          time,
          accountId,
          assetId,
          nationalCurrencyCode,
          cryptocurrencySymbol,
        });
      } catch (err) {
        if (err instanceof ApiError) {
          return err;
        }
        throw err;
      }
      throw new Error('Expected to throw');
    };

    beforeAll(async () => {
      accountBalancesMap = await getAccountHistoricBalancesMap(accounts);
    });

    it('should receive at least one asset balance per account', () => {
      for (const [accountId, accountBalances] of accountBalancesMap.entries()) {
        expect(
          accountBalances.length,
          `received empty balance list for account ${accountId}`
        ).toBeGreaterThan(0);
      }
    });

    it('should return only known assets in balances', () => {
      for (const accountBalances of accountBalancesMap.values()) {
        for (const balance of accountBalances) {
          expect(balance.asset).toSatisfy(isKnownAsset);
        }
      }
    });

    describe('Asset query params', () => {
      it('should fail when using an unknown assetId', async () => {
        for (const accountId of accountBalancesMap.keys()) {
          const error = await getFailedHistoricBalancesResult(accountId, randomUUID());
          expect(error.status).toBe(400);
          expect(error.body.errorType).toBe(BadRequestError.errorType.UNKNOWN_ASSET);
          expect(error.body.requestPart).toBe(RequestPart.QUERYSTRING);
        }
      });

      it.each(invalidAssetParamsCombinations)(
        'should fail when more than one of the query params is defined',
        async ({ assetId, nationalCurrencyCode, cryptocurrencySymbol }) => {
          for (const accountId of accountBalancesMap.keys()) {
            const error = await getFailedHistoricBalancesResult(
              accountId,
              assetId,
              nationalCurrencyCode,
              cryptocurrencySymbol
            );
            expect(error.status).toBe(400);
            expect(error.body.errorType).toBe(BadRequestError.errorType.SCHEMA_ERROR);
            expect(error.body.requestPart).toBe(RequestPart.QUERYSTRING);
          }
        }
      );

      it('should return single item when asset is specified in query', async () => {
        for (const [accountId, balances] of accountBalancesMap.entries()) {
          for (const { asset } of balances) {
            const { balances } = await client.balances.getBalances({
              accountId,
              ...asset,
            });

            expect(balances.length).toBe(1);
            expect(balances[0].asset).toEqual(asset);
            return;
          }
        }
      });
    });
  });
});
