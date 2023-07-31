import Client from '../../src/client';
import config from '../../src/config';
import { AssetsDirectory } from '../utils/assets-directory';
import { getCapableAccounts } from '../utils/capable-accounts';
import { getResponsePerIdMapping } from '../utils/response-per-id-mapping';
import {
  Account,
  AssetReference,
  DepositCapability,
  IbanCapability,
  PublicBlockchainCapability,
  SwiftCapability,
} from '../../src/client/generated';
import { randomUUID } from 'crypto';

const depositAddressTransferCapabilities: string[] = [
  IbanCapability.transferMethod.IBAN,
  SwiftCapability.transferMethod.SWIFT,
  PublicBlockchainCapability.transferMethod.PUBLIC_BLOCKCHAIN,
];

const transfersCapability = config.get('capabilities.components.transfers');

describe.skipIf(!transfersCapability)('Deposits', () => {
  let client: Client;
  let assets: AssetsDirectory;
  let accounts: Account[];
  let accountCapabilitiesMap: Map<string, DepositCapability[]>;
  let isKnownAsset: (assetId: AssetReference) => boolean;
  const getDepositCapabilities = async (accountId, limit, startingAfter?) => {
    const response = await client.capabilities.getDepositMethods({
      accountId,
      limit,
      startingAfter,
    });
    return response.capabilities;
  };

  beforeAll(async () => {
    client = new Client();
    assets = await AssetsDirectory.fetch();
    accounts = await getCapableAccounts(transfersCapability);
    isKnownAsset = assets.isKnownAsset.bind(assets);
    accountCapabilitiesMap = await getResponsePerIdMapping(
      getDepositCapabilities,
      accounts.map((account) => account.id)
    );
  });

  describe('Capabilities', () => {
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
      it('should succeed with every listed capability', async () => {
        for (const [accountId, capabilities] of accountCapabilitiesMap.entries()) {
          const depositAddressCapabilities = capabilities.filter((capability) =>
            depositAddressTransferCapabilities.includes(capability.deposit.transferMethod)
          );

          for (const capability of depositAddressCapabilities) {
            try {
              await client.transfers.createDepositAddress({
                accountId,
                requestBody: { idempotencyKey: randomUUID(), transferMethod: capability.deposit },
              });
            } catch (err) {
              expect({}).fail(
                `Valid deposit address creation request failed with the following error:\n ${JSON.stringify(
                  err
                )}`
              );
            }
          }
        }
      });

      it('should fail when using transfer capability which is not listed', () => {
        expect({}).fail('TODO');
      });

      it('should fail when using an unknown asset', () => {
        expect({}).fail('TODO');
      });

      describe('Using the same idempotency key', () => {
        it('should return the original successful request', () => {
          expect({}).fail('TODO');
        });

        it('should return the original failed request', () => {
          expect({}).fail('TODO');
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
