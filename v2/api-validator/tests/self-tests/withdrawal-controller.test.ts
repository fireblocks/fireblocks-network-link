import { randomUUID } from 'crypto';
import {
  CrossAccountTransferCapability,
  IbanCapability,
  Layer1Cryptocurrency,
  NationalCurrencyCode,
  PublicBlockchainCapability,
  Withdrawal,
} from '../../src/client/generated';
import {
  WithdrawalRequest,
  createAccountBlockchainWithdrawal,
  createAccountFiatWithdrawal,
  createAccountPeerAccountWithdrawal,
  createAccountSubAccountWithdrawal,
  registerIdempotentResponse,
} from '../../src/server/controllers/withdrawal-controller';
import {
  IdempotencyMetadata,
  IdempotencyRequest,
} from '../../src/server/controllers/deposit-controller';
import { IdempotencyKeyReuseError } from '../../src/server/controllers/orders-controller';
import _ from 'lodash';

type WithdrawalOption = {
  name: string;
  withdrawalRequest: WithdrawalRequest;
  fn: (
    accountId: string,
    request,
    idempotencyMap: Map<string, Map<string, IdempotencyMetadata>>,
    withdrawalMap?: Map<string, Withdrawal[]>
  ) => Withdrawal;
};

const withdrawalOptions: WithdrawalOption[] = [
  {
    name: 'Sub account',
    withdrawalRequest: {
      idempotencyKey: randomUUID(),
      balanceAmount: '1',
      balanceAsset: { nationalCurrencyCode: NationalCurrencyCode.USD },
      destination: {
        transferMethod: CrossAccountTransferCapability.transferMethod.INTERNAL_TRANSFER,
        asset: { nationalCurrencyCode: NationalCurrencyCode.USD },
        amount: '1',
        accountId: randomUUID(),
      },
    },
    fn: createAccountSubAccountWithdrawal,
  },
  {
    name: 'Peer account',
    withdrawalRequest: {
      idempotencyKey: randomUUID(),
      balanceAmount: '1',
      balanceAsset: { nationalCurrencyCode: NationalCurrencyCode.USD },
      destination: {
        transferMethod: CrossAccountTransferCapability.transferMethod.PEER_ACCOUNT_TRANSFER,
        asset: { nationalCurrencyCode: NationalCurrencyCode.USD },
        amount: '1',
        accountId: randomUUID(),
      },
    },
    fn: createAccountPeerAccountWithdrawal,
  },
  {
    name: 'Blockchain',
    withdrawalRequest: {
      idempotencyKey: randomUUID(),
      balanceAmount: '1',
      balanceAsset: { cryptocurrencySymbol: Layer1Cryptocurrency.BTC },
      destination: {
        transferMethod: PublicBlockchainCapability.transferMethod.PUBLIC_BLOCKCHAIN,
        asset: { cryptocurrencySymbol: Layer1Cryptocurrency.BTC },
        amount: '1',
        address: randomUUID(),
      },
    },
    fn: createAccountBlockchainWithdrawal,
  },
  {
    name: 'Fiat',
    withdrawalRequest: {
      idempotencyKey: randomUUID(),
      balanceAmount: '1',
      balanceAsset: { nationalCurrencyCode: NationalCurrencyCode.USD },
      destination: {
        transferMethod: IbanCapability.transferMethod.IBAN,
        asset: { nationalCurrencyCode: NationalCurrencyCode.USD },
        amount: '1',
        accountHolder: { name: randomUUID() },
        iban: 'LO16MVPcSq8',
      },
    },
    fn: createAccountFiatWithdrawal,
  },
];

describe('Withdrawal controller', () => {
  describe('Create withdrawal', () => {
    describe.each(withdrawalOptions)('$name', ({ withdrawalRequest, fn }) => {
      const accountId = 'account';
      const accountWithdrawalMap = new Map<string, Withdrawal[]>();
      const idempotencyMap = new Map<string, Map<string, IdempotencyMetadata>>();
      let withdrawal: Withdrawal;

      beforeAll(() => {
        withdrawal = fn(accountId, withdrawalRequest, idempotencyMap, accountWithdrawalMap);
      });

      it('should add withdrawal to account withdrawals', () => {
        expect(accountWithdrawalMap.get(accountId)?.length).toBe(1);
        expect(accountWithdrawalMap.get(accountId)?.[0]).toMatchObject(
          _.omit(withdrawalRequest, 'idempotencyKey')
        );
      });

      describe('Idempotency', () => {
        beforeEach(() => {
          registerIdempotentResponse(
            accountId,
            withdrawalRequest.idempotencyKey,
            {
              requestBody: withdrawalRequest,
              responseBody: withdrawal,
              responseStatus: 200,
            },
            idempotencyMap
          );
        });
        it('should throw idempotency request when calling again with same request', () => {
          expect(() => {
            fn(accountId, withdrawalRequest, idempotencyMap, accountWithdrawalMap);
          }).toThrow(IdempotencyRequest);
        });

        it('should throw idempotency key reuse when using the same idempotency key with different request', () => {
          expect(() => {
            fn(
              accountId,
              { ...withdrawalRequest, balanceAmount: randomUUID() },
              idempotencyMap,
              accountWithdrawalMap
            );
          }).toThrow(IdempotencyKeyReuseError);
        });
      });
    });
  });
});
