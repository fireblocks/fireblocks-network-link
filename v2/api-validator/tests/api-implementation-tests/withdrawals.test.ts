import Client from '../../src/client';
import config from '../../src/config';
import { AssetsDirectory } from '../utils/assets-directory';
import { getCapableAccounts } from '../utils/capable-accounts';
import { getResponsePerIdMapping } from '../utils/response-per-id-mapping';
import {
  Account,
  AssetReference,
  Withdrawal,
  WithdrawalCapability,
} from '../../src/client/generated';
import _ from 'lodash';

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
        transfersCapableAccounts.map((account) => account.id)
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

  describe('List withdrawals', () => {
    let accountWithdrawalsMap: Map<string, Withdrawal[]>;
    let accountFiatWithdrawalsMap: Map<string, Withdrawal[]>;
    let accountBlockchainWithdrawalsMap: Map<string, Withdrawal[]>;
    let accountPeerAccountWithdrawalsMap: Map<string, Withdrawal[]>;

    const getWithdrawals = async (accountId: string, limit: number, startingAfter?: string) => {
      const response = await client.transfers.getWithdrawals({ accountId, limit, startingAfter });
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
    });

    it('should be sorted by creation time', () => {
      const allWithdrawalResponses = [
        ...accountWithdrawalsMap.values(),
        ...accountFiatWithdrawalsMap.values(),
        ...accountBlockchainWithdrawalsMap.values(),
        ...accountPeerAccountWithdrawalsMap.values(),
      ];

      const isSortedByCreationDate = (withdrawals: Withdrawal[]) => {
        const withdrawalsCreationDates = withdrawals.map((withdrawal) => withdrawal.createdAt);
        return (
          JSON.stringify(withdrawalsCreationDates) ==
          JSON.stringify(withdrawalsCreationDates.sort())
        );
      };

      for (const withdrawals of allWithdrawalResponses) {
        expect(withdrawals).toSatisfy(isSortedByCreationDate);
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

    it.skipIf(!transfersBlockchainCapability)(
      'should find every listed blockchain withdrawal in list blockchain withdrawals',
      () => {
        for (const [accountId, withdrawals] of accountWithdrawalsMap.entries()) {
          const existsInBlockchainWithdrawals = (withdrawal: Withdrawal): boolean =>
            !!accountBlockchainWithdrawalsMap
              .get(accountId)
              ?.find((blockchainWithdrawal) => blockchainWithdrawal.id === withdrawal.id);

          for (const withdrawal of withdrawals) {
            expect(withdrawal).toSatisfy(existsInBlockchainWithdrawals);
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
            expect(withdrawal).toSatisfy(existsInFiatWithdrawals);
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
            expect(withdrawal).toSatisfy(existsInPeerAccountWithdrawals);
          }
        }
      }
    );
  });

  describe('Subaccount withdrawals', () => {
    it('should succeed making withdrawal for every capability that the account has sufficient balance for', () => {
      expect({}).fail('TODO');
    });
  });

  describe.skipIf(!transfersBlockchainCapability)('Blockchain withdrawals', () => {
    it('should succeed making withdrawal for every capability that the account has sufficient balance for', () => {
      expect({}).fail('TODO');
    });
  });

  describe.skipIf(!transfersFiatCapability)('Fiat withdrawals', () => {
    it('should succeed making withdrawal for every capability that the account has sufficient balance for', () => {
      expect({}).fail('TODO');
    });
  });

  describe.skipIf(!transfersPeerAccountsCapability)('Peer account withdrawals', () => {
    it('should succeed making withdrawal for every capability that the account has sufficient balance for', () => {
      expect({}).fail('TODO');
    });
  });
});
