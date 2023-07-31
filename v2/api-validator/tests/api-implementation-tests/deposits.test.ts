import Client from '../../src/client';
import config from '../../src/config';
import { AssetsDirectory } from '../utils/assets-directory';
import { getCapableAccounts } from '../utils/capable-accounts';
import { getResponsePerIdMapping } from '../utils/response-per-id-mapping';
import {
  Account,
  ApiError,
  AssetReference,
  BadRequestError,
  DepositAddressCreationRequest,
  DepositCapability,
  IbanCapability,
  PublicBlockchainCapability,
  RequestPart,
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
    const getCreateDepositAddressFailureResult = async (
      accountId: string,
      requestBody: DepositAddressCreationRequest
    ): Promise<ApiError> => {
      try {
        await client.transfers.createDepositAddress({
          accountId,
          requestBody,
        });
      } catch (err) {
        if (err instanceof ApiError) {
          return err;
        }
        throw err;
      }
      throw new Error('Expected to throw');
    };

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
              if (err instanceof ApiError) {
                expect({}).fail(
                  `Valid deposit address creation request for account ${accountId} failed: ${err.message}`
                );
              }
              expect({}).fail(
                `Unexpected error in valid deposit address creation request for account ${accountId}`
              );
            }
          }
        }
      });

      it('should fail when using transfer capability which is not listed', () => {
        expect({}).fail('TODO');
      });

      it('should fail when using an unknown asset', async () => {
        const requestBody: DepositAddressCreationRequest = {
          idempotencyKey: randomUUID(),
          transferMethod: {
            transferMethod: PublicBlockchainCapability.transferMethod.PUBLIC_BLOCKCHAIN,
            asset: { assetId: randomUUID() },
          },
        };
        for (const { id: accountId } of accounts) {
          const error = await getCreateDepositAddressFailureResult(accountId, requestBody);

          expect(error.status).toBe(400);
          expect(error.body.errorType).toBe(BadRequestError.errorType.UNKNOWN_ASSET);
          expect(error.body.requestPart).toBe(RequestPart.BODY);
          expect(error.body.propertyName).toBe('/destination/asset/assetId');
        }
      });

      describe('Using the same idempotency key', () => {
        it("should return the original successful request's response", () => {
          expect({}).fail('TODO');
        });

        it("should return the original failed request's response", () => {
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
