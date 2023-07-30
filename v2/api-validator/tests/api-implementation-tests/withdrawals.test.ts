import Client from '../../src/client';
import config from '../../src/config';
import { AssetsDirectory } from '../utils/assets-directory';
import { getCapableAccounts } from '../utils/capable-accounts';
import { getResponsePerIdMapping } from '../utils/response-per-id-mapping';
import { Account, AssetReference, WithdrawalCapability } from '../../src/client/generated';

const transfersCapability = config.get('capabilities.components.transfers');

describe.skipIf(!transfersCapability)('Withdrawals', () => {
  let client: Client;
  let assets: AssetsDirectory;
  let accounts: Account[];
  let isKnownAsset: (assetId: AssetReference) => boolean;

  beforeAll(async () => {
    client = new Client();
    assets = await AssetsDirectory.fetch();
    accounts = await getCapableAccounts(transfersCapability);
    isKnownAsset = assets.isKnownAsset.bind(assets);
  });

  describe('Capabilities', () => {
    let accountCapabilitiesMap: Map<string, WithdrawalCapability[]>;

    const getCapabilities = async (accountId: string, limit: number, startingAfter?) => {
      const response = await client.capabilities.getWithdrawalMethods({
        accountId,
        limit,
        startingAfter,
      });
      return response.capabilities;
    };

    beforeAll(async () => {
      accountCapabilitiesMap = await getResponsePerIdMapping(
        getCapabilities,
        accounts.map((account) => account.id)
      );
    });

    it('should return only known assets in response', () => {
      for (const capabilities of accountCapabilitiesMap.values()) {
        for (const capability of capabilities) {
          expect(capability.balanceAsset).toSatisfy(isKnownAsset);
          expect(capability.withdrawal.asset).toSatisfy(isKnownAsset);
        }
      }
    });
  });
});
