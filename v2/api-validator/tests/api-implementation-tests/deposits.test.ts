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
  DepositAddress,
  DepositAddressCreationRequest,
  DepositAddressStatus,
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
              const depositAddress = await client.transfers.createDepositAddress({
                accountId,
                requestBody: { idempotencyKey: randomUUID(), transferMethod: capability.deposit },
              });
              expect(
                depositAddress.status,
                'Created deposit address status should be enabled'
              ).toBe(DepositAddressStatus.ENABLED);
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
        let accountIdForRequest: string;
        let successBody: DepositAddressCreationRequest;
        let failureBody: DepositAddressCreationRequest;
        let successResponse: DepositAddress;
        let failureResponse: ApiError;

        beforeAll(async () => {
          // Searching for account with deposit capabilities
          for (const [accountId, capabilities] of accountCapabilitiesMap.entries()) {
            if (capabilities.length) {
              accountIdForRequest = accountId;
              successBody = {
                idempotencyKey: randomUUID(),
                transferMethod: { ...capabilities[0].deposit },
              };
              break;
            }
          }

          // Accounting for the possible scenario where there aren't any deposit capabilities for any account
          if (!accountIdForRequest) {
            return;
          }

          failureBody = {
            idempotencyKey: randomUUID(),
            transferMethod: {
              transferMethod: PublicBlockchainCapability.transferMethod.PUBLIC_BLOCKCHAIN,
              asset: { assetId: randomUUID() },
            },
          };

          successResponse = await client.transfers.createDepositAddress({
            accountId: accountIdForRequest,
            requestBody: successBody,
          });
          failureResponse = await getCreateDepositAddressFailureResult(
            accountIdForRequest,
            failureBody
          );
        });

        it("should return the original successful request's response", async () => {
          if (!accountIdForRequest) {
            expect({}).pass('No deposit capabilities found, passing');
            return;
          }

          const response = await client.transfers.createDepositAddress({
            accountId: accountIdForRequest,
            requestBody: successBody,
          });

          expect(response).toEqual(successResponse);
        });

        it("should return the original failed request's response", async () => {
          if (!accountIdForRequest) {
            expect({}).pass('No deposit capabilities found, passing');
            return;
          }

          const response = await getCreateDepositAddressFailureResult(
            accountIdForRequest,
            failureBody
          );

          expect(response).toEqual(failureResponse);
        });

        it('should fail when sending different request body', async () => {
          if (!accountIdForRequest) {
            expect({}).pass('No deposit capabilities found, passing');
            return;
          }

          const error = await getCreateDepositAddressFailureResult(accountIdForRequest, {
            idempotencyKey: successBody.idempotencyKey,
            transferMethod: failureBody.transferMethod,
          });

          expect(error.status).toBe(400);
          expect(error.body.errorType).toBe(BadRequestError.errorType.USED_IDEMPOTENCY_KEY);
        });
      });
    });

    describe('Get list of existing deposit addresses', () => {
      let accountDepositAddressesMap: Map<string, DepositAddress[]>;
      const getDepositAddresses = async (accountId, limit, startingAfter?) => {
        const response = await client.transfers.getDepositAddresses({
          accountId,
          limit,
          startingAfter,
        });
        return response.addresses;
      };
      beforeAll(async () => {
        accountDepositAddressesMap = await getResponsePerIdMapping(
          getDepositAddresses,
          accounts.map((account) => account.id)
        );
      });

      it('should return only known assets', () => {
        for (const depositAddresses of accountDepositAddressesMap.values()) {
          for (const depositAddress of depositAddresses) {
            expect(depositAddress.destination.asset).toSatisfy(isKnownAsset);
          }
        }
      });

      it('should find each deposit address on getDepositAddressDetails', async () => {
        for (const [accountId, depositAddresses] of accountDepositAddressesMap.entries()) {
          for (const { id } of depositAddresses) {
            const depositAddressDetails = await client.transfers.getDepositAddressDetails({
              accountId,
              id,
            });
            expect(depositAddressDetails).toBeDefined();
            expect(depositAddressDetails.id).toBe(id);
          }
        }
      });
    });

    describe('Disable a deposit address', () => {
      // TODO
    });
  });
});
