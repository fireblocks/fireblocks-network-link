import { randomUUID } from 'crypto';
import config from '../../src/config';
import Client from '../../src/client';
import { AssetsDirectory } from '../utils/assets-directory';
import { getAllCapableAccountIds, hasCapability } from '../utils/capable-accounts';
import { getResponsePerIdMapping } from '../utils/response-per-id-mapping';
import {
  ApiError,
  AssetBalance,
  BadRequestError,
  BlockchainWithdrawalRequest,
  FiatWithdrawalRequest,
  IbanCapability,
  InternalTransferCapability,
  InternalWithdrawalRequest,
  CryptocurrencySymbol,
  NationalCurrencyCode,
  PeerAccountTransferCapability,
  PeerAccountWithdrawalRequest,
  PublicBlockchainCapability,
  SwiftCapability,
  Withdrawal,
  WithdrawalCapability,
} from '../../src/client/generated';

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

  beforeAll(async () => {
    assets = await AssetsDirectory.fetch();

    client = new Client();
    accountCapabilitiesMap = await getResponsePerIdMapping(
      getCapabilities,
      transfersCapableAccountIds
    );
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

    it.skipIf(noTransfersBlockchainCapability)(
      'should find every listed blockchain withdrawal in list blockchain withdrawals',
      () => {
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
      }
    );

    it.skipIf(noTransfersFiatCapability)(
      'should find every listed fiat withdrawal in list fiat withdrawals',
      () => {
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
      }
    );

    it.skipIf(noTransfersPeerAccountsCapability)(
      'should find every listed peer account withdrawal in list peer account withdrawals',
      () => {
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
      }
    );
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

    describe.skipIf(noTransfersSubaccountCapability)('Subaccount withdrawal', () => {
      it('should succeed making withdrawal for every capability that the account has sufficient balance for', async () => {
        for (const [accountId, capabilities] of accountCapabilitiesMap.entries()) {
          const subAccountCapabilities = capabilities.filter(
            (capability) =>
              capability.withdrawal.transferMethod ===
              InternalTransferCapability.transferMethod.INTERNAL_TRANSFER
          );

          for (const capability of subAccountCapabilities) {
            const minWithdrawalAmount = capability.minWithdrawalAmount ?? '0';
            const assetBalance = await getCapabilityAssetBalance(accountId, capability);

            if (
              !assetBalance ||
              Number(assetBalance.availableAmount) < Number(minWithdrawalAmount)
            ) {
              continue;
            }

            const requestBody: InternalWithdrawalRequest = {
              idempotencyKey: randomUUID(),
              balanceAmount: minWithdrawalAmount,
              balanceAsset: capability.balanceAsset,
              destination: {
                ...subAccountDestinationConfig,
                amount: minWithdrawalAmount,
                asset: capability.withdrawal.asset,
                transferMethod: InternalTransferCapability.transferMethod.INTERNAL_TRANSFER,
              },
            };
            const withdrawal = await client.transfersInternal.createSubAccountWithdrawal({
              accountId,
              requestBody,
            });
            expect(withdrawal).toBeDefined();
          }
        }
      });

      describe('Idempotency', () => {
        let accountId: string;
        let withdrawalRequest: InternalWithdrawalRequest;
        let withdrawalResponse: Withdrawal | ApiError;

        const getSubAccountWithdrawalResponse = async (
          requestBody: InternalWithdrawalRequest
        ): Promise<Withdrawal | ApiError> => {
          try {
            return await client.transfersInternal.createSubAccountWithdrawal({
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
            balanceAsset: { nationalCurrencyCode: NationalCurrencyCode.USD },
            destination: {
              ...subAccountDestinationConfig,
              amount: '1',
              asset: { nationalCurrencyCode: NationalCurrencyCode.USD },
              transferMethod: InternalTransferCapability.transferMethod.INTERNAL_TRANSFER,
            },
          };
          withdrawalResponse = await getSubAccountWithdrawalResponse(withdrawalRequest);
        });

        it('should return same response when using the same idempotency key', async () => {
          const idempotentResponse = await getSubAccountWithdrawalResponse(withdrawalRequest);
          expect(idempotentResponse).toEqual(withdrawalResponse);
        });

        it('should return idempotency key reuse error when using used key for different request', async () => {
          const differentWithdrawalRequest = { ...withdrawalRequest, balanceAmount: '0' };
          const idempotencyKeyReuseResponse = await getSubAccountWithdrawalResponse(
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
    });

    describe.skipIf(noTransfersBlockchainCapability)('Blockchain withdrawal', () => {
      it('should succeed making withdrawal for every capability that the account has sufficient balance for', async () => {
        for (const [accountId, capabilities] of accountCapabilitiesMap.entries()) {
          const subAccountCapabilities = capabilities.filter(
            (capability) =>
              capability.withdrawal.transferMethod ===
              PublicBlockchainCapability.transferMethod.PUBLIC_BLOCKCHAIN
          );

          for (const capability of subAccountCapabilities) {
            const minWithdrawalAmount = capability.minWithdrawalAmount ?? '0';
            const assetBalance = await getCapabilityAssetBalance(accountId, capability);

            if (
              !assetBalance ||
              Number(assetBalance.availableAmount) < Number(minWithdrawalAmount)
            ) {
              continue;
            }

            const requestBody: BlockchainWithdrawalRequest = {
              idempotencyKey: randomUUID(),
              balanceAmount: minWithdrawalAmount,
              balanceAsset: capability.balanceAsset,
              destination: {
                ...blockchainDestinationConfig,
                amount: minWithdrawalAmount,
                asset: capability.withdrawal.asset,
                transferMethod: capability.withdrawal.transferMethod,
              },
            };
            const withdrawal = await client.transfersBlockchain.createBlockchainWithdrawal({
              accountId,
              requestBody,
            });
            expect(withdrawal).toBeDefined();
          }
        }
      });

      describe('Idempotency', () => {
        let accountId: string;
        let withdrawalRequest: BlockchainWithdrawalRequest;
        let withdrawalResponse: Withdrawal | ApiError;

        const getBlockchainWithdrawalResponse = async (
          requestBody: BlockchainWithdrawalRequest
        ): Promise<Withdrawal | ApiError> => {
          try {
            return await client.transfersBlockchain.createBlockchainWithdrawal({
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
            balanceAsset: { cryptocurrencySymbol: CryptocurrencySymbol.BTC },
            destination: {
              ...blockchainDestinationConfig,
              amount: '1',
              asset: { cryptocurrencySymbol: CryptocurrencySymbol.BTC },
              transferMethod: PublicBlockchainCapability.transferMethod.PUBLIC_BLOCKCHAIN,
            },
          };
          withdrawalResponse = await getBlockchainWithdrawalResponse(withdrawalRequest);
        });

        it('should return same response when using the same idempotency key', async () => {
          const idempotentResponse = await getBlockchainWithdrawalResponse(withdrawalRequest);
          expect(idempotentResponse).toEqual(withdrawalResponse);
        });

        it('should return idempotency key reuse error when using used key for different request', async () => {
          const differentWithdrawalRequest = { ...withdrawalRequest, balanceAmount: '0' };
          const idempotencyKeyReuseResponse = await getBlockchainWithdrawalResponse(
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
    });

    describe.skipIf(noTransfersFiatCapability)('Fiat withdrawal', () => {
      it('should succeed making withdrawal for every capability that the account has sufficient balance for', async () => {
        for (const [accountId, capabilities] of accountCapabilitiesMap.entries()) {
          const fiatCapabilities = capabilities.filter((capability) =>
            fiatTransferMethods.includes(capability.withdrawal.transferMethod)
          );

          for (const capability of fiatCapabilities) {
            const minWithdrawalAmount = capability.minWithdrawalAmount ?? '0';
            const assetBalance = await getCapabilityAssetBalance(accountId, capability);

            if (
              assetBalance &&
              Number(assetBalance.availableAmount) > Number(minWithdrawalAmount)
            ) {
              const destinationAddress =
                capability.withdrawal.transferMethod === IbanCapability.transferMethod.IBAN
                  ? ibanDestinationConfig
                  : swiftDestinationConfig;
              const requestBody: FiatWithdrawalRequest = {
                idempotencyKey: randomUUID(),
                balanceAmount: minWithdrawalAmount,
                balanceAsset: capability.balanceAsset,
                destination: {
                  ...destinationAddress,
                  amount: minWithdrawalAmount,
                  asset: capability.withdrawal.asset,
                  transferMethod: capability.withdrawal.transferMethod,
                },
              };
              const withdrawal = await client.transfersFiat.createFiatWithdrawal({
                accountId,
                requestBody,
              });
              expect(withdrawal).toBeDefined();
            }
          }
        }
      });

      describe('Idempotency', () => {
        let accountId: string;
        let withdrawalRequest: FiatWithdrawalRequest;
        let withdrawalResponse: Withdrawal | ApiError;

        const getFiatWithdrawalResponse = async (
          requestBody: FiatWithdrawalRequest
        ): Promise<Withdrawal | ApiError> => {
          try {
            return await client.transfersFiat.createFiatWithdrawal({
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
            balanceAsset: { nationalCurrencyCode: NationalCurrencyCode.USD },
            destination: {
              ...swiftDestinationConfig,
              amount: '1',
              asset: { nationalCurrencyCode: NationalCurrencyCode.USD },
              transferMethod: SwiftCapability.transferMethod.SWIFT,
            },
          };
          withdrawalResponse = await getFiatWithdrawalResponse(withdrawalRequest);
        });

        it('should return same response when using the same idempotency key', async () => {
          const idempotentResponse = await getFiatWithdrawalResponse(withdrawalRequest);
          expect(idempotentResponse).toEqual(withdrawalResponse);
        });

        it('should return idempotency key reuse error when using used key for different request', async () => {
          const differentWithdrawalRequest = { ...withdrawalRequest, balanceAmount: '0' };
          const idempotencyKeyReuseResponse = await getFiatWithdrawalResponse(
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
    });

    describe.skipIf(noTransfersPeerAccountsCapability)('Peer account withdrawal', () => {
      it('should succeed making withdrawal for every capability that the account has sufficient balance for', async () => {
        for (const [accountId, capabilities] of accountCapabilitiesMap.entries()) {
          const subAccountCapabilities = capabilities.filter(
            (capability) =>
              capability.withdrawal.transferMethod ===
              PeerAccountTransferCapability.transferMethod.PEER_ACCOUNT_TRANSFER
          );

          for (const capability of subAccountCapabilities) {
            const minWithdrawalAmount = capability.minWithdrawalAmount ?? '0';
            const assetBalance = await getCapabilityAssetBalance(accountId, capability);

            if (
              assetBalance &&
              Number(assetBalance.availableAmount) > Number(minWithdrawalAmount)
            ) {
              const requestBody: PeerAccountWithdrawalRequest = {
                idempotencyKey: randomUUID(),
                balanceAmount: minWithdrawalAmount,
                balanceAsset: capability.balanceAsset,
                destination: {
                  ...peerAccountDestinationConfig,
                  amount: minWithdrawalAmount,
                  asset: capability.withdrawal.asset,
                  transferMethod:
                    PeerAccountTransferCapability.transferMethod.PEER_ACCOUNT_TRANSFER,
                },
              };
              const withdrawal = await client.transfersPeerAccounts.createPeerAccountWithdrawal({
                accountId,
                requestBody,
              });
              expect(withdrawal).toBeDefined();
            }
          }
        }
      });

      describe('Idempotency', () => {
        let accountId: string;
        let withdrawalRequest: PeerAccountWithdrawalRequest;
        let withdrawalResponse: Withdrawal | ApiError;

        const getPeerAccountWithdrawalResponse = async (
          requestBody: PeerAccountWithdrawalRequest
        ): Promise<Withdrawal | ApiError> => {
          try {
            return await client.transfersPeerAccounts.createPeerAccountWithdrawal({
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
            balanceAsset: { nationalCurrencyCode: NationalCurrencyCode.USD },
            destination: {
              ...peerAccountDestinationConfig,
              amount: '1',
              asset: { nationalCurrencyCode: NationalCurrencyCode.USD },
              transferMethod: PeerAccountTransferCapability.transferMethod.PEER_ACCOUNT_TRANSFER,
            },
          };
          withdrawalResponse = await getPeerAccountWithdrawalResponse(withdrawalRequest);
        });

        it('should return same response when using the same idempotency key', async () => {
          const idempotentResponse = await getPeerAccountWithdrawalResponse(withdrawalRequest);
          expect(idempotentResponse).toEqual(withdrawalResponse);
        });

        it('should return idempotency key reuse error when using used key for different request', async () => {
          const differentWithdrawalRequest = { ...withdrawalRequest, balanceAmount: '0' };
          const idempotencyKeyReuseResponse = await getPeerAccountWithdrawalResponse(
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
    });
  });
});
