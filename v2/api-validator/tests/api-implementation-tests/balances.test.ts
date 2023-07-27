import {
  Account,
  AssetBalance,
  AssetReference,
  BalanceCapability,
} from '../../src/client/generated';
import { AssetsDirectory } from '../utils/assets-directory';
import Client from '../../src/client';
import { Pageable, paginated } from '../utils/pagination';
import config from '../../src/config';
import _ from 'lodash';

describe('Balances', () => {
  let client: Client;
  let assets: AssetsDirectory;
  let account: Account;
  const capabilitesResponse: BalanceCapability[] = [];
  let isKnownAsset: (asset: AssetReference) => boolean;

  const isBalanceCapableAsset = (asset: AssetReference) => {
    return capabilitesResponse.some((capability) => _.isEqual(capability.asset, asset));
  };

  const getCapabilities: Pageable<BalanceCapability> = async (limit, startingAfter?) => {
    const response = await client.capabilities.getBalanceAssets({ limit, startingAfter });
    return response.capabilities;
  };

  beforeAll(async () => {
    client = new Client();
    assets = await AssetsDirectory.fetch();
    account = await getBalanceCapableAccount();
    for await (const balanceCapability of paginated(getCapabilities)) {
      capabilitesResponse.push(balanceCapability);
    }
    isKnownAsset = assets.isKnownAsset.bind(assets);
  });

  describe('Capabilities', () => {
    it('every asset reference in response should be known by the server', async () => {
      expect(capabilitesResponse.length).toBeGreaterThan(0);

      for (const capability of capabilitesResponse) {
        expect(capability.asset).toSatisfy(isKnownAsset);
      }
    });
  });

  describe('List balances', () => {
    const accountBalances: AssetBalance[] = [];

    const getBalances: Pageable<AssetBalance> = async (limit, startingAfter?) => {
      const response = await client.balances.getBalances({
        accountId: account.id,
        limit,
        startingAfter,
      });
      return response.balances;
    };

    beforeAll(async () => {
      for await (const balance of paginated(getBalances)) {
        accountBalances.push(balance);
      }
    });

    it('should return only known assets in balances', () => {
      for (const balance of accountBalances) {
        expect(balance.asset).toSatisfy(isKnownAsset);
      }
    });

    it('should return only asset balances listed in capabilities', () => {
      for (const balance of accountBalances) {
        expect(balance.asset).toSatisfy(isBalanceCapableAsset);
      }
    });
  });

  describe('List historic balances', () => {
    const historicAccountBalances: AssetBalance[] = [];
    const time = new Date(Date.now()).toISOString();

    const getHistoricBalances: Pageable<AssetBalance> = async (limit, startingAfter?) => {
      const response = await client.historicBalances.getHistoricBalances({
        accountId: account.id,
        limit,
        startingAfter,
        time,
      });
      return response.balances;
    };

    beforeAll(async () => {
      for await (const balance of paginated(getHistoricBalances)) {
        historicAccountBalances.push(balance);
      }
    });

    it('should return only known assets in balances', () => {
      for (const balance of historicAccountBalances) {
        expect(balance.asset).toSatisfy(isKnownAsset);
      }
    });

    it('should return only asset balances listed in capabilities', () => {
      for (const balance of historicAccountBalances) {
        expect(balance.asset).toSatisfy(isBalanceCapableAsset);
      }
    });
  });
});

async function getBalanceCapableAccount(): Promise<Account> {
  const capabilitiesLiquidity = config.get('capabilities.components.balances');
  const client = new Client();

  if (Array.isArray(capabilitiesLiquidity)) {
    const accountId = capabilitiesLiquidity[0];
    return await client.accounts.getAccountDetails({ accountId });
  }

  const accounts = await client.accounts.getAccounts({});
  return accounts.accounts[0];
}
