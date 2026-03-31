import { randomUUID } from 'crypto';
import Client from '../../src/client';
import { AssetsDirectory } from '../utils/assets-directory';
import { getResponsePerIdMapping } from '../utils/response-per-id-mapping';
import { getAllCapableAccountIds, hasCapability } from '../utils/capable-accounts';
import {
  ApiError,
  AssetReference,
  BadRequestError,
  Deposit,
  DepositAddress,
  DepositAddressCreationPolicy,
  DepositAddressCreationRequest,
  DepositAddressStatus,
  DepositCapability,
  IbanCapability,
  InternalTransferCapability,
  InternalTransferMethod,
  NativeCryptocurrency,
  PeerAccountTransferCapability,
  PublicBlockchainCapability,
  RequestPart,
  type TransferCapability,
} from '../../src/client/generated';
import { fakeSchemaObject } from '../../src/schemas';
import _, { range } from 'lodash';

const noTransfersCapability = !hasCapability('transfers');
const noDepositAddressCapabilities =
  !hasCapability('transfersBlockchain') && !hasCapability('transfersFiat');
const accountIds = getAllCapableAccountIds('transfers');

function isInternalOrP2PTransfer(
  capability: TransferCapability
): capability is PeerAccountTransferCapability | InternalTransferCapability {
  return (
    capability.transferMethod === InternalTransferMethod.transferMethod.INTERNAL_TRANSFER ||
    capability.transferMethod === PeerAccountTransferCapability.transferMethod.PEER_ACCOUNT_TRANSFER
  );
}

describe.skipIf(noTransfersCapability)('Deposits', () => {
  let client: Client;
  let assets: AssetsDirectory;
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

  const findDepositCapabilitySupportingAddressCreation = ():
    | {
        accountId: string;
        capability: PublicBlockchainCapability | IbanCapability;
      }
    | undefined => {
    for (const [accountId, capabilities] of accountCapabilitiesMap.entries()) {
      const capability = capabilities.find(
        (c) => c.addressCreationPolicy === DepositAddressCreationPolicy.CAN_CREATE
      );
      if (capability && !isInternalOrP2PTransfer(capability.deposit)) {
        return { accountId, capability: capability.deposit };
      }
    }
  };

  beforeAll(async () => {
    client = new Client();
    assets = await AssetsDirectory.fetch();
    isKnownAsset = assets.isKnownAsset.bind(assets);
    accountCapabilitiesMap = await getResponsePerIdMapping(getDepositCapabilities, accountIds);
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

  describe.skipIf(noDepositAddressCapabilities)('Deposit addresses', () => {
    const getClientForTransferMethod = (transferMethod: string) => {
      if (transferMethod === PublicBlockchainCapability.transferMethod.PUBLIC_BLOCKCHAIN) {
        return client.transfersBlockchain;
      } else if (transferMethod === IbanCapability.transferMethod.IBAN) {
        return client.transfersFiat;
      }
      throw new Error(`Unsupported transfer method for deposit addresses: ${transferMethod}`);
    };

    const getCreateDepositAddressFailureResult = async (
      accountId: string,
      requestBody: DepositAddressCreationRequest
    ): Promise<ApiError> => {
      try {
        const transferClient = getClientForTransferMethod(
          requestBody.transferMethod.transferMethod
        );
        await transferClient.createDepositAddress({
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
      it('should succeed with every listed capability with CAN_CREATE deposit address creation policy', async () => {
        for (const [accountId, capabilities] of accountCapabilitiesMap.entries()) {
          for (const capability of capabilities.filter(
            (dc) => dc.addressCreationPolicy === DepositAddressCreationPolicy.CAN_CREATE
          )) {
            if (isInternalOrP2PTransfer(capability.deposit)) {
              continue;
            }

            try {
              const transferClient = getClientForTransferMethod(capability.deposit.transferMethod);
              const depositAddress = await transferClient.createDepositAddress({
                accountId,
                requestBody: { idempotencyKey: randomUUID(), transferMethod: capability.deposit },
              });
              expect(
                depositAddress.status,
                `Created deposit address ${depositAddress.id} status should be enabled`
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

      it('should fail with every listed capability with CANNOT_CREATE deposit address creation policy', async () => {
        for (const [accountId, capabilities] of accountCapabilitiesMap.entries()) {
          for (const capability of capabilities.filter(
            (dc) => dc.addressCreationPolicy === DepositAddressCreationPolicy.CANNOT_CREATE
          )) {
            if (isInternalOrP2PTransfer(capability.deposit)) {
              continue;
            }

            const requestBody: DepositAddressCreationRequest = {
              idempotencyKey: capability.id,
              transferMethod: capability.deposit,
            };
            const error = await getCreateDepositAddressFailureResult(accountId, requestBody);

            expect(error.status).toBe(400);
            expect(error.body.errorType).toBe(
              BadRequestError.errorType.DEPOSIT_ADDRESS_CREATION_NOT_ALLOWED
            );
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
        for (const accountId of accountIds) {
          const error = await getCreateDepositAddressFailureResult(accountId, requestBody);

          expect(error.status).toBe(400);
          expect(error.body.errorType).toBe(BadRequestError.errorType.UNKNOWN_ASSET);
          expect(error.body.requestPart).toBe(RequestPart.BODY);
          expect(error.body.propertyName).toBe('/transferMethod/asset/assetId');
        }
      });
      const ITERATIONS_NUMBER = 10;

      const fakeBlockchainCapability = fakeSchemaObject(
        'PublicBlockchainCapability'
      ) as PublicBlockchainCapability;
      fakeBlockchainCapability.asset = fakeSchemaObject(
        'NativeCryptocurrency'
      ) as NativeCryptocurrency;
      // Test multiple times due to the randomness of the generated transfer method
      describe.each(range(1, ITERATIONS_NUMBER))(
        'should fail when using an a unknown transfer method - attempt %d',
        () => {
          it.each([fakeSchemaObject('IbanCapability') as IbanCapability, fakeBlockchainCapability])(
            'should fail when using an unknown %s transfer method',
            async (fakeCapability) => {
              const requestBody: DepositAddressCreationRequest = {
                idempotencyKey: randomUUID(),
                transferMethod: fakeCapability,
              };
              for (const [accountId, capabilities] of accountCapabilitiesMap.entries()) {
                if (capabilities.some((dc) => _.isEqual(dc.deposit, fakeCapability))) {
                  continue;
                }
                const error = await getCreateDepositAddressFailureResult(accountId, requestBody);

                expect(error.status).toBe(400);
                expect(error.body.errorType).toBe(
                  BadRequestError.errorType.UNSUPPORTED_TRANSFER_METHOD
                );
              }
            }
          );
        }
      );

      describe('Using the same idempotency key', () => {
        let accountId: string;
        let successBody: DepositAddressCreationRequest;
        let failureBody: DepositAddressCreationRequest;
        let successResponse: DepositAddress;
        let failureResponse: ApiError;

        beforeAll(async () => {
          const accountCapability = findDepositCapabilitySupportingAddressCreation();

          // Accounting for the possible scenario where there aren't any deposit capabilities for any account
          if (!accountCapability) {
            return;
          }

          accountId = accountCapability.accountId;
          successBody = {
            idempotencyKey: randomUUID(),
            transferMethod: accountCapability.capability,
          };

          failureBody = {
            idempotencyKey: randomUUID(),
            transferMethod: {
              transferMethod: PublicBlockchainCapability.transferMethod.PUBLIC_BLOCKCHAIN,
              asset: { assetId: randomUUID() },
            },
          };
          const transferClient = getClientForTransferMethod(
            successBody.transferMethod.transferMethod
          );
          successResponse = await transferClient.createDepositAddress({
            accountId,
            requestBody: successBody,
          });
          failureResponse = await getCreateDepositAddressFailureResult(accountId, failureBody);
        });

        it("should return the original successful request's response", async () => {
          if (!accountId) {
            expect({}).pass('No deposit capabilities found, passing');
            return;
          }

          const transferClient = getClientForTransferMethod(
            successBody.transferMethod.transferMethod
          );
          const response = await transferClient.createDepositAddress({
            accountId: accountId,
            requestBody: successBody,
          });

          expect(response).toEqual(successResponse);
        });

        it("should return the original failed request's response", async () => {
          if (!accountId) {
            expect({}).pass('No deposit capabilities found, passing');
            return;
          }

          const response = await getCreateDepositAddressFailureResult(accountId, failureBody);

          expect(response).toEqual(failureResponse);
        });

        it('should fail when sending different request body', async () => {
          if (!accountId) {
            expect({}).pass('No deposit capabilities found, passing');
            return;
          }

          const error = await getCreateDepositAddressFailureResult(accountId, {
            idempotencyKey: successBody.idempotencyKey,
            transferMethod: failureBody.transferMethod,
          });

          expect(error.status).toBe(400);
          expect(error.body.errorType).toBe(BadRequestError.errorType.IDEMPOTENCY_KEY_REUSE);
        });
      });
    });

    describe('Get list of existing deposit addresses', () => {
      let accountDepositAddressesMap: Map<string, DepositAddress[]>;
      const getDepositAddresses = async (accountId, limit, startingAfter?) => {
        let allAddresses: DepositAddress[] = [];

        // Get blockchain deposit addresses if capability exists
        if (hasCapability('transfersBlockchain')) {
          try {
            const blockchainResponse = await client.transfersBlockchain.getDepositAddresses({
              accountId,
              limit,
              startingAfter,
            });
            allAddresses = allAddresses.concat(blockchainResponse.addresses);
          } catch (error) {
            // Continue if this service doesn't exist for this account
          }
        }

        // Get fiat deposit addresses if capability exists
        if (hasCapability('transfersFiat')) {
          try {
            const fiatResponse = await client.transfersFiat.getDepositAddresses({
              accountId,
              limit,
              startingAfter,
            });
            allAddresses = allAddresses.concat(fiatResponse.addresses);
          } catch (error) {
            // Continue if this service doesn't exist for this account
          }
        }

        return allAddresses;
      };
      beforeAll(async () => {
        accountDepositAddressesMap = await getResponsePerIdMapping(getDepositAddresses, accountIds);
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
          for (const depositAddress of depositAddresses) {
            let details: DepositAddress | null = null;

            // Try blockchain service first
            if (hasCapability('transfersBlockchain')) {
              try {
                details = await client.transfersBlockchain.getDepositAddressDetails({
                  accountId,
                  id: depositAddress.id,
                });
              } catch (error) {
                // Continue to fiat if not found
              }
            }

            // Try fiat service if not found in blockchain
            if (!details && hasCapability('transfersFiat')) {
              try {
                details = await client.transfersFiat.getDepositAddressDetails({
                  accountId,
                  id: depositAddress.id,
                });
              } catch (error) {
                // Address not found in either service
              }
            }

            expect(details).toBeDefined();
            expect(details?.id).toBe(depositAddress.id);
          }
        }
      });
    });

    describe('Disable a deposit address', () => {
      let accountId;
      let disabledDepositAddress: DepositAddress;
      let transferMethodType: string;

      const getDisableDepositAddressFailureResult = async (
        accountId: string,
        depositAddressId: string,
        transferMethod: string
      ): Promise<ApiError> => {
        try {
          const transferClient = getClientForTransferMethod(transferMethod);
          await transferClient.disableDepositAddress({
            accountId,
            id: depositAddressId,
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
        const accountCapability = findDepositCapabilitySupportingAddressCreation();

        if (!accountCapability?.accountId) {
          return;
        }
        if (isInternalOrP2PTransfer(accountCapability.capability)) {
          expect({ accountCapability }).fail(
            'Internal and p2p transfers cannot have CanCreate deposit address creation policy'
          );
          return;
        }

        accountId = accountCapability.accountId;
        transferMethodType = accountCapability.capability.transferMethod;
        const requestBody = {
          idempotencyKey: randomUUID(),
          transferMethod: accountCapability.capability,
        };

        const transferClient = getClientForTransferMethod(transferMethodType);
        const { id } = await transferClient.createDepositAddress({
          accountId,
          requestBody,
        });

        disabledDepositAddress = await transferClient.disableDepositAddress({
          accountId,
          id,
        });
      });

      it('should have deposit address status changed to disabled', () => {
        if (!accountId) {
          expect({}).pass('No deposit capabilities found, passing');
          return;
        }

        expect(disabledDepositAddress.status).toBe(DepositAddressStatus.DISABLED);
      });

      it('should find deposit address on getDepositAddressDetails post disable', async () => {
        if (!accountId) {
          expect({}).pass('No deposit capabilities found, passing');
          return;
        }

        const transferClient = getClientForTransferMethod(transferMethodType);
        const response = await transferClient.getDepositAddressDetails({
          accountId,
          id: disabledDepositAddress.id,
        });
        expect(response.id).toBe(disabledDepositAddress.id);
        expect(response.status).toBe(disabledDepositAddress.status);
      });

      it('should fail to disable an already disabled address', async () => {
        if (!accountId) {
          expect({}).pass('No deposit capabilities found, passing');
          return;
        }

        const error = await getDisableDepositAddressFailureResult(
          accountId,
          disabledDepositAddress.id,
          transferMethodType
        );
        expect(error.status).toBe(400);
        expect(error.body.errorType).toBe(BadRequestError.errorType.DEPOSIT_ADDRESS_DISABLED);
      });
    });
  });

  describe('Deposits', () => {
    let accountDepositsMap: Map<string, Deposit[]>;
    const getDeposits = async (accountId: string, limit: number, startingAfter?: string) => {
      const response = await client.transfers.getDeposits({ accountId, limit, startingAfter });
      return response.deposits;
    };

    beforeAll(async () => {
      accountDepositsMap = await getResponsePerIdMapping(getDeposits, accountIds);
    });

    it('should return deposits in descending order of creation', () => {
      for (const deposits of accountDepositsMap.values()) {
        if (deposits.length < 2) {
          expect({}).fail('Not enough deposits to test order');
        }
        const sortedDeposits = deposits.sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        expect(deposits).toEqual(sortedDeposits);
      }
    });

    it('should find each returned deposit on getDepositDetails', async () => {
      for (const [accountId, deposits] of accountDepositsMap.entries()) {
        for (const { id } of deposits) {
          try {
            const depositDetails = await client.transfers.getDepositDetails({ accountId, id });
            expect(depositDetails.id).toBe(id);
          } catch (err) {
            if (err instanceof ApiError) {
              expect({}).fail(
                `Received server error getting deposit ${id} of account ${accountId} failed: ${err.message}`
              );
            }
            expect({}).fail(
              `Unexpected error getDepositDetails for deposit ${id} of account ${accountId}`
            );
          }
        }
      }
    });

    it('should return only known assets in response', () => {
      for (const deposits of accountDepositsMap.values()) {
        for (const { balanceAsset } of deposits) {
          expect(balanceAsset).toSatisfy(isKnownAsset);
        }
      }
    });
  });
});
