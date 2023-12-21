import { randomUUID } from 'crypto';
import config from '../../src/config';
import Client from '../../src/client';
import { AssetsDirectory } from '../utils/assets-directory';
import { getAllCapableAccountIds, hasCapability } from '../utils/capable-accounts';
import { getResponsePerIdMapping } from '../utils/response-per-id-mapping';
import {
  Account,
  ApiError,
  AssetBalance,
  AssetReference,
  BadRequestError,
  IbanCapability,
  InternalTransferCapability,
  InternalWithdrawalRequest,
  CryptocurrencySymbol,
  NationalCurrencyCode,
  PeerAccountTransferCapability,
  PublicBlockchainCapability,
  SwiftCapability,
  Withdrawal,
  WithdrawalCapability,
} from '../../src/client/generated';
import { fakeSchemaObject } from '../../src/schemas';
import { getFailureResult } from '../utils/test-utils';
import _ from 'lodash';
import { WithdrawalRequest } from '../../src/server/controllers/withdrawal-controller';
import { arrayFromAsyncGenerator, paginated } from '../utils/pagination';
import { isParentAccount } from '../../src/utils/account-helper';

const noTransfersCapability = !hasCapability('transfers');
const noTransfersBlockchainCapability = !hasCapability('transfersBlockchain');
const noTransfersFiatCapability = !hasCapability('transfersFiat');
const noTransfersPeerAccountsCapability = !hasCapability('transfersPeerAccounts');
const noTransfersSubaccountCapability = Client.getCachedAccounts().length <= 1;

const transfersCapableAccountIds = getAllCapableAccountIds('transfers');
const blockchainTransfersCapableAccountIds = getAllCapableAccountIds('transfersBlockchain');
const fiatTransfersCapableAccountIds = getAllCapableAccountIds('transfersFiat');
const peerAccountTransfersCapableAccountIds = getAllCapableAccountIds('transfersPeerAccounts');

describe.skipIf(noTransfersCapability)('Withdrawals', () => {
  let client: Client;
  let assets: AssetsDirectory;
  let accountCapabilitiesMap: Map<string, WithdrawalCapability[]>;
  let accountsMap: Map<string, Account>;
  const fiatTransferMethods: string[] = [
    IbanCapability.transferMethod.IBAN,
    SwiftCapability.transferMethod.SWIFT,
  ];

  const getCapabilities = async (accountId: string, limit: number, startingAfter?) => {
    const response = await client.capabilities.getWithdrawalMethods({
      accountId,
      limit,
      startingAfter,
    });
    return response.capabilities;
  };

  const getAccounts = async (limit: number, startingAfter?) => {
    const response = await client.accounts.getAccounts({
      limit,
      startingAfter,
    });
    return response.accounts;
  };

  beforeAll(async () => {
    assets = await AssetsDirectory.fetch();

    client = new Client();
    accountCapabilitiesMap = await getResponsePerIdMapping(
      getCapabilities,
      transfersCapableAccountIds
    );

    const accounts = await arrayFromAsyncGenerator(paginated(getAccounts));
    accountsMap = new Map<string, Account>();
    accounts.forEach((account) => accountsMap.set(account.id, account));
  });

  describe('Capabilities', () => {
    it('should return only known assets in response', () => {
      for (const capabilities of accountCapabilitiesMap.values()) {
        for (const capability of capabilities) {
          expect(
            assets.isKnownAsset(capability.balanceAsset),
            JSON.stringify(capability.balanceAsset)
          ).toBeTruthy();
          expect(
            assets.isKnownAsset(capability.withdrawal.asset),
            JSON.stringify(capability.withdrawal.asset)
          ).toBeTruthy();
        }
      }
    });
  });

  describe('List withdrawals', () => {
    let accountWithdrawalsMap: Map<string, Withdrawal[]>;
    let accountFiatWithdrawalsMap: Map<string, Withdrawal[]>;
    let accountBlockchainWithdrawalsMap: Map<string, Withdrawal[]>;
    let accountPeerAccountWithdrawalsMap: Map<string, Withdrawal[]>;
    let accountSubAccountWithdrawalsMap: Map<string, Withdrawal[]>;

    const getWithdrawals = async (accountId: string, limit: number, startingAfter?: string) => {
      const response = await client.transfers.getWithdrawals({ accountId, limit, startingAfter });
      return response.withdrawals;
    };

    const getSubAccountWithdrawals = async (
      accountId: string,
      limit: number,
      startingAfter?: string
    ) => {
      if (noTransfersSubaccountCapability) {
        return [];
      }
      const response = await client.transfersInternal.getSubAccountWithdrawals({
        accountId,
        limit,
        startingAfter,
      });
      return response.withdrawals;
    };

    const getFiatWithdrawals = async (accountId: string, limit: number, startingAfter?: string) => {
      if (noTransfersFiatCapability) {
        return [];
      }
      const response = await client.transfersFiat.getFiatWithdrawals({
        accountId,
        limit,
        startingAfter,
      });
      return response.withdrawals;
    };

    const getBlockchainWithdrawals = async (
      accountId: string,
      limit: number,
      startingAfter?: string
    ) => {
      if (noTransfersBlockchainCapability) {
        return [];
      }
      const response = await client.transfersBlockchain.getBlockchainWithdrawals({
        accountId,
        limit,
        startingAfter,
      });
      return response.withdrawals;
    };

    const getPeerAccountWithdrawals = async (
      accountId: string,
      limit: number,
      startingAfter?: string
    ) => {
      if (noTransfersPeerAccountsCapability) {
        return [];
      }
      const response = await client.transfersPeerAccounts.getPeerAccountWithdrawals({
        accountId,
        limit,
        startingAfter,
      });
      return response.withdrawals;
    };

    beforeAll(async () => {
      accountWithdrawalsMap = await getResponsePerIdMapping(
        getWithdrawals,
        transfersCapableAccountIds
      );
      accountFiatWithdrawalsMap = await getResponsePerIdMapping(
        getFiatWithdrawals,
        fiatTransfersCapableAccountIds
      );
      accountBlockchainWithdrawalsMap = await getResponsePerIdMapping(
        getBlockchainWithdrawals,
        blockchainTransfersCapableAccountIds
      );
      accountPeerAccountWithdrawalsMap = await getResponsePerIdMapping(
        getPeerAccountWithdrawals,
        peerAccountTransfersCapableAccountIds
      );
      accountSubAccountWithdrawalsMap = await getResponsePerIdMapping(
        getSubAccountWithdrawals,
        transfersCapableAccountIds
      );
    });

    it('should be sorted by creation time in a decending order', () => {
      const allWithdrawalResponses = [
        ...accountWithdrawalsMap.values(),
        ...accountFiatWithdrawalsMap.values(),
        ...accountBlockchainWithdrawalsMap.values(),
        ...accountPeerAccountWithdrawalsMap.values(),
      ];

      const isSortedByDecendingCreationTime = (withdrawals: Withdrawal[]) => {
        const withdrawalsCreationTimes = withdrawals.map((withdrawal) => withdrawal.createdAt);
        return (
          JSON.stringify(withdrawalsCreationTimes) ==
          JSON.stringify(withdrawalsCreationTimes.sort((a, b) => (a <= b ? 1 : -1)))
        );
      };

      for (const withdrawals of allWithdrawalResponses) {
        expect(withdrawals).toSatisfy(isSortedByDecendingCreationTime);
      }
    });

    it('should find every listed withdrawal get withdrawal details endpoint', async () => {
      for (const [accountId, withdrawals] of accountWithdrawalsMap.entries()) {
        for (const withdrawal of withdrawals) {
          const withdrawalDetails = await client.transfers.getWithdrawalDetails({
            accountId,
            id: withdrawal.id,
          });
          expect(withdrawalDetails.id).toBe(withdrawal.id);
        }
      }
    });

    it('should find every listed sub account withdrawal in list sub account withdrawals', () => {
      for (const [accountId, withdrawals] of accountWithdrawalsMap.entries()) {
        const existsInSubAccountWithdrawals = (withdrawal: Withdrawal): boolean =>
          !!accountSubAccountWithdrawalsMap
            .get(accountId)
            ?.find((subAccountWithdrawal) => subAccountWithdrawal.id === withdrawal.id);

        for (const withdrawal of withdrawals) {
          if (
            withdrawal.destination.transferMethod ===
            InternalTransferCapability.transferMethod.INTERNAL_TRANSFER
          ) {
            expect(withdrawal).toSatisfy(existsInSubAccountWithdrawals);
          } else {
            expect(withdrawal).not.toSatisfy(existsInSubAccountWithdrawals);
          }
        }
      }
    });

    it('should find every listed blockchain withdrawal in list blockchain withdrawals', () => {
      for (const [accountId, withdrawals] of accountWithdrawalsMap.entries()) {
        const existsInBlockchainWithdrawals = (withdrawal: Withdrawal): boolean =>
          !!accountBlockchainWithdrawalsMap
            .get(accountId)
            ?.find((blockchainWithdrawal) => blockchainWithdrawal.id === withdrawal.id);

        for (const withdrawal of withdrawals) {
          if (
            withdrawal.destination.transferMethod ===
            PublicBlockchainCapability.transferMethod.PUBLIC_BLOCKCHAIN
          ) {
            expect(withdrawal).toSatisfy(existsInBlockchainWithdrawals);
          } else {
            expect(withdrawal).not.toSatisfy(existsInBlockchainWithdrawals);
          }
        }
      }
    });

    it('should find every listed fiat withdrawal in list fiat withdrawals', () => {
      for (const [accountId, withdrawals] of accountWithdrawalsMap.entries()) {
        const existsInFiatWithdrawals = (withdrawal: Withdrawal): boolean =>
          !!accountFiatWithdrawalsMap
            .get(accountId)
            ?.find((fiatWithdrawal) => fiatWithdrawal.id === withdrawal.id);
        for (const withdrawal of withdrawals) {
          if (fiatTransferMethods.includes(withdrawal.destination.transferMethod)) {
            expect(withdrawal).toSatisfy(existsInFiatWithdrawals);
          } else {
            expect(withdrawal).not.toSatisfy(existsInFiatWithdrawals);
          }
        }
      }
    });

    it('should find every listed peer account withdrawal in list peer account withdrawals', () => {
      for (const [accountId, withdrawals] of accountWithdrawalsMap.entries()) {
        const existsInPeerAccountWithdrawals = (withdrawal: Withdrawal): boolean =>
          !!accountPeerAccountWithdrawalsMap
            .get(accountId)
            ?.find((peerAccountWithdrawal) => peerAccountWithdrawal.id === withdrawal.id);

        for (const withdrawal of withdrawals) {
          if (
            withdrawal.destination.transferMethod ===
            PeerAccountTransferCapability.transferMethod.PEER_ACCOUNT_TRANSFER
          ) {
            expect(withdrawal).toSatisfy(existsInPeerAccountWithdrawals);
          } else {
            expect(withdrawal).not.toSatisfy(existsInPeerAccountWithdrawals);
          }
        }
      }
    });
  });

  describe('Create withdrawal', () => {
    const subAccountDestinationConfig = config.get('withdrawal.subAccount');
    const peerAccountDestinationConfig = config.get('withdrawal.peerAccount');
    const blockchainDestinationConfig = config.get('withdrawal.blockchain');
    const swiftDestinationConfig = config.get('withdrawal.swift');
    const ibanDestinationConfig = config.get('withdrawal.iban');

    const getCapabilityAssetBalance = async (
      accountId: string,
      capability: WithdrawalCapability
    ): Promise<AssetBalance | undefined> => {
      const { balances } = await client.balances.getBalances({
        accountId,
        ...capability.balanceAsset,
      });

      if (balances.length !== 1) {
        return;
      }

      return balances[0];
    };
    describe.each([
      {
        transferMethod: InternalTransferCapability.transferMethod.INTERNAL_TRANSFER,
        config: subAccountDestinationConfig,
        createWithdrawal: (client: Client, { accountId, requestBody }) =>
          client.transfersInternal.createSubAccountWithdrawal({ accountId, requestBody }),
        assetExample: { nationalCurrencyCode: NationalCurrencyCode.USD },
        noRelevantCapability: noTransfersSubaccountCapability,
        additionalFilters: [
          (capability: WithdrawalCapability) =>
            (capability.withdrawal as InternalTransferCapability).limitations?.parentOnly !== true,
        ],
      },
      {
        transferMethod: PeerAccountTransferCapability.transferMethod.PEER_ACCOUNT_TRANSFER,
        config: peerAccountDestinationConfig,
        createWithdrawal: (client: Client, { accountId, requestBody }) =>
          client.transfersPeerAccounts.createPeerAccountWithdrawal({ accountId, requestBody }),
        assetExample: { nationalCurrencyCode: NationalCurrencyCode.USD },
        noRelevantCapability: noTransfersPeerAccountsCapability,
      },
      {
        transferMethod: PublicBlockchainCapability.transferMethod.PUBLIC_BLOCKCHAIN,
        config: blockchainDestinationConfig,
        createWithdrawal: (client: Client, { accountId, requestBody }) =>
          client.transfersBlockchain.createBlockchainWithdrawal({ accountId, requestBody }),
        assetExample: { cryptocurrencySymbol: CryptocurrencySymbol.BTC },
        noRelevantCapability: noTransfersBlockchainCapability,
      },
      {
        transferMethod: SwiftCapability.transferMethod.SWIFT,
        config: swiftDestinationConfig,
        createWithdrawal: (client: Client, { accountId, requestBody }) =>
          client.transfersFiat.createFiatWithdrawal({ accountId, requestBody }),
        assetExample: { nationalCurrencyCode: NationalCurrencyCode.USD },
        noRelevantCapability: noTransfersFiatCapability,
      },
      {
        transferMethod: IbanCapability.transferMethod.IBAN,
        config: ibanDestinationConfig,
        createWithdrawal: (client: Client, { accountId, requestBody }) =>
          client.transfersFiat.createFiatWithdrawal({ accountId, requestBody }),
        assetExample: { nationalCurrencyCode: NationalCurrencyCode.USD },
        noRelevantCapability: noTransfersFiatCapability,
      },
    ])(
      '$transferMethod withdrawal',
      ({
        transferMethod,
        config,
        createWithdrawal,
        assetExample,
        noRelevantCapability,
        additionalFilters,
      }) => {
        it.skipIf(noRelevantCapability)(
          'should succeed making withdrawal for every capability that the account has sufficient balance for',
          async () => {
            for (const [accountId, capabilities] of accountCapabilitiesMap.entries()) {
              const transferMethodSpecificCapabilities = capabilities.filter(
                (capability) =>
                  capability.withdrawal.transferMethod === transferMethod &&
                  (additionalFilters === undefined ||
                    additionalFilters.map((f) => f(capability)).every((v) => v === true))
              );

              for (const capability of transferMethodSpecificCapabilities) {
                const minWithdrawalAmount = capability.minWithdrawalAmount ?? '0';
                const assetBalance = await getCapabilityAssetBalance(accountId, capability);

                if (
                  !assetBalance ||
                  Number(assetBalance.availableAmount) < Number(minWithdrawalAmount)
                ) {
                  continue;
                }

                const requestBody = {
                  idempotencyKey: randomUUID(),
                  balanceAmount: minWithdrawalAmount,
                  balanceAsset: capability.balanceAsset,
                  destination: {
                    ...config,
                    amount: minWithdrawalAmount,
                    ...capability.withdrawal,
                    // asset: capability.withdrawal.asset,
                    // transferMethod: capability.withdrawal.transferMethod,
                  },
                };

                const withdrawal = await createWithdrawal(client, {
                  accountId,
                  requestBody,
                });
                expect(withdrawal).toBeDefined();
              }
            }
          }
        );

        it.skipIf(noRelevantCapability)(
          'should fail making withdrawal when the transfer capability not exists',
          async () => {
            for (const [accountId, capabilities] of accountCapabilitiesMap.entries()) {
              const transferMethodSpecificCapabilities = capabilities.filter(
                (capability) =>
                  capability.withdrawal.transferMethod === transferMethod &&
                  (additionalFilters === undefined ||
                    additionalFilters.map((f) => f(capability)).every((v) => v === true))
              );

              for (const capability of transferMethodSpecificCapabilities) {
                const minWithdrawalAmount = capability.minWithdrawalAmount ?? '0';
                const assetBalance = await getCapabilityAssetBalance(accountId, capability);

                const fakeAssetReference = fakeSchemaObject('AssetReference') as AssetReference;

                if (
                  !assetBalance ||
                  Number(assetBalance.availableAmount) < Number(minWithdrawalAmount) ||
                  transferMethodSpecificCapabilities.find((c) =>
                    _.isEqual(c.balanceAsset, fakeAssetReference)
                  ) !== undefined
                ) {
                  continue;
                }

                const requestBody = {
                  idempotencyKey: randomUUID(),
                  balanceAmount: minWithdrawalAmount,
                  balanceAsset: fakeAssetReference,
                  destination: {
                    ...config,
                    amount: minWithdrawalAmount,
                    ...capability.withdrawal,
                  },
                };
                const error = await getFailureResult(() =>
                  createWithdrawal(client, {
                    accountId,
                    requestBody,
                  })
                );
                expect(error.status).toBe(400);
                expect(error.body.errorType).toBe(
                  BadRequestError.errorType.UNSUPPORTED_TRANSFER_METHOD
                );
              }
            }
          }
        );

        describe.skipIf(noRelevantCapability)('Idempotency', () => {
          let accountId: string;
          let withdrawalRequest: WithdrawalRequest;
          let withdrawalResponse: Withdrawal | ApiError;

          const getWithdrawalResponse = async (
            requestBody: WithdrawalRequest
          ): Promise<Withdrawal | ApiError> => {
            try {
              return await createWithdrawal(client, {
                accountId,
                requestBody,
              });
            } catch (err) {
              if (err instanceof ApiError) {
                return err;
              } else {
                throw err;
              }
            }
          };

          beforeAll(async () => {
            accountId = transfersCapableAccountIds[0];
            withdrawalRequest = {
              idempotencyKey: 'some-key',
              balanceAmount: '1',
              balanceAsset: assetExample,
              destination: {
                ...config,
                amount: '1',
                asset: assetExample,
                transferMethod: transferMethod,
              },
            };
            withdrawalResponse = await getWithdrawalResponse(withdrawalRequest);
          });

          it('should return same response when using the same idempotency key', async () => {
            const idempotentResponse = await getWithdrawalResponse(withdrawalRequest);
            expect(idempotentResponse).toEqual(withdrawalResponse);
          });

          it('should return idempotency key reuse error when using used key for different request', async () => {
            const differentWithdrawalRequest = { ...withdrawalRequest, balanceAmount: '0' };
            const idempotencyKeyReuseResponse = await getWithdrawalResponse(
              differentWithdrawalRequest
            );

            if (!(idempotencyKeyReuseResponse instanceof ApiError)) {
              expect({}).fail('Expected idempotency key reuse request to fail');
              return;
            }
            expect(idempotencyKeyReuseResponse.status).toBe(400);
            expect(idempotencyKeyReuseResponse.body.errorType).toBe(
              BadRequestError.errorType.IDEMPOTENCY_KEY_REUSE
            );
          });
        });
      }
    );

    describe.skipIf(noTransfersSubaccountCapability)(
      'InternalTransfer withdrawal - special cases',
      () => {
        it('should succeed making withdrawal to a valid parent, for each capability where parentOnly is enabled', async () => {
          for (const [accountId, capabilities] of accountCapabilitiesMap.entries()) {
            const subAccountCapabilities = capabilities.filter(
              (capability) =>
                capability.withdrawal.transferMethod ===
                  InternalTransferCapability.transferMethod.INTERNAL_TRANSFER &&
                capability.withdrawal.limitations?.parentOnly === true
            );

            for (const capability of subAccountCapabilities) {
              const minWithdrawalAmount = capability.minWithdrawalAmount ?? '0';
              const assetBalance = await getCapabilityAssetBalance(accountId, capability);

              const parentId = accountsMap.get(accountId)?.parentId;
              if (parentId === undefined) {
                continue;
              }
              if (
                assetBalance &&
                Number(assetBalance.availableAmount) > Number(minWithdrawalAmount)
              ) {
                const requestBody: InternalWithdrawalRequest = {
                  idempotencyKey: randomUUID(),
                  balanceAmount: minWithdrawalAmount,
                  balanceAsset: capability.balanceAsset,
                  destination: {
                    accountId: parentId,
                    amount: minWithdrawalAmount,
                    ...(capability.withdrawal as InternalTransferCapability),
                  },
                };
                const withdrawal = await client.transfersInternal.createSubAccountWithdrawal({
                  accountId,
                  requestBody,
                });
                expect(withdrawal).toBeDefined();
              }
            }
          }
        });
        it('should fail when making withdrawal to a non valid parent, for each capability where parentOnly is enabled', async () => {
          for (const [accountId, capabilities] of accountCapabilitiesMap.entries()) {
            const subAccountCapabilities = capabilities.filter(
              (capability) =>
                capability.withdrawal.transferMethod ===
                  InternalTransferCapability.transferMethod.INTERNAL_TRANSFER &&
                capability.withdrawal.limitations?.parentOnly === true
            );

            for (const capability of subAccountCapabilities) {
              const minWithdrawalAmount = capability.minWithdrawalAmount ?? '0';
              const assetBalance = await getCapabilityAssetBalance(accountId, capability);

              const parentId = accountsMap.get(accountId)?.parentId;
              if (parentId === undefined) {
                continue;
              }
              const noParent = Array.from(accountsMap.values()).find(
                (a) => !isParentAccount(accountId, a.id, accountsMap.get.bind(accountsMap))
              )?.id;
              if (noParent === undefined) {
                continue;
              }

              if (
                assetBalance &&
                Number(assetBalance.availableAmount) > Number(minWithdrawalAmount)
              ) {
                const requestBody: InternalWithdrawalRequest = {
                  idempotencyKey: randomUUID(),
                  balanceAmount: minWithdrawalAmount,
                  balanceAsset: capability.balanceAsset,
                  destination: {
                    accountId: noParent,
                    amount: minWithdrawalAmount,
                    ...(capability.withdrawal as InternalTransferCapability),
                  },
                };
                const error = await getFailureResult(() =>
                  client.transfersInternal.createSubAccountWithdrawal({
                    accountId,
                    requestBody,
                  })
                );
                expect(error.status).toBe(400);
                expect(error.body.errorType).toBe(
                  BadRequestError.errorType.TRANSFER_DESTINATION_NOT_ALLOWED
                );
              }
            }
          }
        });
      }
    );
  });
});
