import Client from '../../src/client';
import config from '../../src/config';
import { AssetsDirectory } from '../utils/assets-directory';
import { getCapableAccounts } from '../utils/capable-accounts';
import { getResponsePerIdMapping } from '../utils/response-per-id-mapping';
import { Account, AssetReference, DepositCapability } from '../../src/client/generated';

const transfersCapability = config.get('capabilities.components.transfers');

describe.skipIf(!transfersCapability)('Deposits', () => {
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
    let accountCapabilitiesMap: Map<string, DepositCapability[]>;

    const getDepositCapabilities = async (accountId, limit, startingAfter?) => {
      const response = await client.capabilities.getDepositMethods({
        accountId,
        limit,
        startingAfter,
      });
      return response.capabilities;
    };

    beforeAll(async () => {
      accountCapabilitiesMap = await getResponsePerIdMapping(
        getDepositCapabilities,
        accounts.map((account) => account.id)
      );
    });

    it('should return only known assets in response', () => {
      for (const capabilities of accountCapabilitiesMap.values()) {
        for (const capability of capabilities) {
          expect(capability.balanceAsset).toSatisfy(isKnownAsset);
          expect(capability.deposit.asset).toSatisfy(isKnownAsset);
        }
      }
    });
  });

  describe('Deposit addresses', () => {
    describe('Create new deposit address', () => {
      it('should succeed with every listed capability', () => {
        // TODO
      });

      it('should fail when using transfer capability which is not listed', () => {
        // TODO
      });

      it('should fail when using an unknown asset', () => {
        // TODO
      });

      describe('Using the same idempotency key', () => {
        it('should return the original successful request', () => {
          // TODO
        });

        it('should return the original failed request', () => {
          // TODO
        });
      });
    });

    describe('Get list of existing deposit addresses', () => {
      // TODO
    });

    describe('Get details of a deposit address', () => {
      // TODO
    });

    describe('Disable a deposit address', () => {
      // TODO
    });
  });
});
