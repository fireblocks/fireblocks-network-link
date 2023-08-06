import Client from '../../src/client';
import config from '../../src/config';
import { AssetsDirectory } from '../utils/assets-directory';
import { getCapableAccounts } from '../utils/capable-accounts';
import { getResponsePerIdMapping } from '../utils/response-per-id-mapping';
import {
  Account,
  AssetBalance,
  AssetReference,
  BlockchainWithdrawalRequest,
  CrossAccountTransferCapability,
  CrossAccountWithdrawalRequest,
  FiatWithdrawalRequest,
  IbanCapability,
  PublicBlockchainCapability,
  SwiftCapability,
  Withdrawal,
  WithdrawalCapability,
} from '../../src/client/generated';
import { Pageable, paginated } from '../utils/pagination';
import _ from 'lodash';
import { randomUUID } from 'crypto';

const transfersCapability = config.get('capabilities.components.transfers');
const transfersBlockchainCapability = config.get('capabilities.components.transfersBlockchain');
const transfersFiatCapability = config.get('capabilities.components.transfersFiat');
const transfersPeerAccountsCapability = config.get('capabilities.components.transfersPeerAccounts');

describe.skipIf(!transfersCapability)('Withdrawals', () => {
  let client: Client;
  let assets: AssetsDirectory;
  let transfersCapableAccounts: Account[];
  let blockchainTransfersCapableAccounts: Account[];
  let fiatTransfersCapableAccounts: Account[];
  let peerAccountTransfersCapableAccounts: Account[];
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

  let isKnownAsset: (assetId: AssetReference) => boolean;

  beforeAll(async () => {
    client = new Client();
    assets = await AssetsDirectory.fetch();
    transfersCapableAccounts = await getCapableAccounts(transfersCapability);
    blockchainTransfersCapableAccounts = transfersBlockchainCapability
      ? await getCapableAccounts(transfersBlockchainCapability)
      : [];
    fiatTransfersCapableAccounts = transfersFiatCapability
      ? await getCapableAccounts(transfersFiatCapability)
      : [];
    peerAccountTransfersCapableAccounts = transfersPeerAccountsCapability
      ? await getCapableAccounts(transfersPeerAccountsCapability)
      : [];
    accountCapabilitiesMap = await getResponsePerIdMapping(
      getCapabilities,
      transfersCapableAccounts.map((account) => account.id)
    );
    isKnownAsset = assets.isKnownAsset.bind(assets);
  });

  describe('Capabilities', () => {
    it('should return only known assets in response', () => {
      for (const capabilities of accountCapabilitiesMap.values()) {
        for (const capability of capabilities) {
          expect(capability.balanceAsset).toSatisfy(isKnownAsset);
          expect(capability.withdrawal.asset).toSatisfy(isKnownAsset);
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
      const response = await client.accounts.getSubAccountWithdrawals({
        accountId,
        limit,
        startingAfter,
      });
      return response.withdrawals;
    };

    const getFiatWithdrawals = async (accountId: string, limit: number, startingAfter?: string) => {
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
        transfersCapableAccounts.map((account) => account.id)
      );
      accountFiatWithdrawalsMap = await getResponsePerIdMapping(
        getFiatWithdrawals,
        fiatTransfersCapableAccounts.map((account) => account.id)
      );
      accountBlockchainWithdrawalsMap = await getResponsePerIdMapping(
        getBlockchainWithdrawals,
        blockchainTransfersCapableAccounts.map((account) => account.id)
      );
      accountPeerAccountWithdrawalsMap = await getResponsePerIdMapping(
        getPeerAccountWithdrawals,
        peerAccountTransfersCapableAccounts.map((account) => account.id)
      );
      accountSubAccountWithdrawalsMap = await getResponsePerIdMapping(
        getSubAccountWithdrawals,
        transfersCapableAccounts.map((account) => account.id)
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
            CrossAccountTransferCapability.transferMethod.INTERNAL_TRANSFER
          ) {
            expect(withdrawal).toSatisfy(existsInSubAccountWithdrawals);
          } else {
            expect(withdrawal).not.toSatisfy(existsInSubAccountWithdrawals);
          }
        }
      }
    });

    it.skipIf(!transfersBlockchainCapability)(
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

    it.skipIf(!transfersFiatCapability)(
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

    it.skipIf(!transfersPeerAccountsCapability)(
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
              CrossAccountTransferCapability.transferMethod.PEER_ACCOUNT_TRANSFER
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
    let accountBalancesMap: Map<string, AssetBalance[]>;

    const getAccounts: Pageable<Account> = async (limit, startingAfter?) => {
      const response = await client.accounts.getAccounts({ limit, startingAfter });
      return response.accounts;
    };

    const getBalances = async (accountId, limit, startingAfter?) => {
      const response = await client.balances.getBalances({
        accountId,
        limit,
        startingAfter,
      });
      return response.balances;
    };

    beforeAll(async () => {
      const allAccounts: string[] = [];
      for await (const { id } of paginated(getAccounts)) {
        allAccounts.push(id);
      }
      accountBalancesMap = await getResponsePerIdMapping(getBalances, allAccounts);
    });

    describe('Subaccount withdrawal', () => {
      it('should succeed making withdrawal for every capability that the account has sufficient balance for', async () => {
        const subAccountDestinationConfig = config.get('withdrawal.subAccount');

        for (const [accountId, capabilities] of accountCapabilitiesMap.entries()) {
          const subAccountCapabilities = capabilities.filter(
            (capability) =>
              capability.withdrawal.transferMethod ===
              CrossAccountTransferCapability.transferMethod.INTERNAL_TRANSFER
          );

          for (const capability of subAccountCapabilities) {
            const minWithdrawalAmount = capability.minWithdrawalAmount ?? '0';
            const assetBalance = accountBalancesMap
              .get(accountId)
              ?.find((balance) => _.isMatch(balance.asset, capability.balanceAsset));

            if (
              assetBalance &&
              Number(assetBalance.availableAmount) > Number(minWithdrawalAmount)
            ) {
              const requestBody: CrossAccountWithdrawalRequest = {
                idempotencyKey: randomUUID(),
                balanceAmount: minWithdrawalAmount,
                balanceAsset: assetBalance.asset,
                destination: {
                  accountId: subAccountDestinationConfig,
                  amount: minWithdrawalAmount,
                  asset: assetBalance.asset,
                  transferMethod: CrossAccountTransferCapability.transferMethod.INTERNAL_TRANSFER,
                },
              };
              const withdrawal = await client.accounts.createSubAccountWithdrawal({
                accountId,
                requestBody,
              });
              expect(withdrawal).toBeDefined();
            }
          }
        }
      });
    });

    describe.skipIf(!transfersBlockchainCapability)('Blockchain withdrawal', () => {
      it('should succeed making withdrawal for every capability that the account has sufficient balance for', async () => {
        const blockchainDestinationConfig = config.get('withdrawal.blockchain');

        for (const [accountId, capabilities] of accountCapabilitiesMap.entries()) {
          const subAccountCapabilities = capabilities.filter(
            (capability) =>
              capability.withdrawal.transferMethod ===
              PublicBlockchainCapability.transferMethod.PUBLIC_BLOCKCHAIN
          );

          for (const capability of subAccountCapabilities) {
            const minWithdrawalAmount = capability.minWithdrawalAmount ?? '0';
            const assetBalance = accountBalancesMap
              .get(accountId)
              ?.find((balance) => _.isMatch(balance.asset, capability.balanceAsset));

            if (
              assetBalance &&
              Number(assetBalance.availableAmount) > Number(minWithdrawalAmount)
            ) {
              const requestBody: BlockchainWithdrawalRequest = {
                idempotencyKey: randomUUID(),
                balanceAmount: minWithdrawalAmount,
                balanceAsset: assetBalance.asset,
                destination: {
                  ...blockchainDestinationConfig,
                  amount: minWithdrawalAmount,
                  asset: assetBalance.asset,
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
        }
      });
    });

    describe.skipIf(!transfersFiatCapability)('Fiat withdrawal', () => {
      it('should succeed making withdrawal for every capability that the account has sufficient balance for', async () => {
        const swiftDestinationConfig = config.get('withdrawal.swift');
        const ibanDestinationConfig = config.get('withdrawal.iban');

        for (const [accountId, capabilities] of accountCapabilitiesMap.entries()) {
          const fiatCapabilities = capabilities.filter((capability) =>
            fiatTransferMethods.includes(capability.withdrawal.transferMethod)
          );

          for (const capability of fiatCapabilities) {
            const minWithdrawalAmount = capability.minWithdrawalAmount ?? '0';
            const assetBalance = accountBalancesMap
              .get(accountId)
              ?.find((balance) => _.isMatch(balance.asset, capability.balanceAsset));

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
                balanceAsset: assetBalance.asset,
                destination: {
                  ...destinationAddress,
                  amount: minWithdrawalAmount,
                  asset: assetBalance.asset,
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
    });

    describe.skipIf(!transfersPeerAccountsCapability)('Peer account withdrawal', () => {
      it('should succeed making withdrawal for every capability that the account has sufficient balance for', async () => {
        const peerAccountDestinationConfig = config.get('withdrawal.subAccount');

        for (const [accountId, capabilities] of accountCapabilitiesMap.entries()) {
          const subAccountCapabilities = capabilities.filter(
            (capability) =>
              capability.withdrawal.transferMethod ===
              CrossAccountTransferCapability.transferMethod.PEER_ACCOUNT_TRANSFER
          );

          for (const capability of subAccountCapabilities) {
            const minWithdrawalAmount = capability.minWithdrawalAmount ?? '0';
            const assetBalance = accountBalancesMap
              .get(accountId)
              ?.find((balance) => _.isMatch(balance.asset, capability.balanceAsset));

            if (
              assetBalance &&
              Number(assetBalance.availableAmount) > Number(minWithdrawalAmount)
            ) {
              const requestBody: CrossAccountWithdrawalRequest = {
                idempotencyKey: randomUUID(),
                balanceAmount: minWithdrawalAmount,
                balanceAsset: assetBalance.asset,
                destination: {
                  accountId: peerAccountDestinationConfig,
                  amount: minWithdrawalAmount,
                  asset: assetBalance.asset,
                  transferMethod:
                    CrossAccountTransferCapability.transferMethod.PEER_ACCOUNT_TRANSFER,
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
    });
  });
});
