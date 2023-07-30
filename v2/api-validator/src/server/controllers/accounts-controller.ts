import {
  Account,
  AccountStatus,
  Layer1Cryptocurrency,
  NationalCurrencyCode,
} from '../../client/generated';
import { SUPPORTED_ASSETS } from './assets-controller';

export const ACCOUNTS: Account[] = [
  {
    id: '1',
    balances: [
      {
        asset: { assetId: SUPPORTED_ASSETS[0].id },
        availableAmount: '1',
        id: '1',
      },
      {
        asset: { nationalCurrencyCode: NationalCurrencyCode.USD },
        availableAmount: '1',
        id: '2',
      },
      {
        asset: { cryptocurrencySymbol: Layer1Cryptocurrency.ETH },
        availableAmount: '1',
        id: '3',
      },
    ],
    status: AccountStatus.ACTIVE,
    title: '',
    description: '',
  },
  {
    id: '2',
    balances: [
      {
        asset: { nationalCurrencyCode: NationalCurrencyCode.USD },
        availableAmount: '1',
        id: '1',
      },
    ],
    status: AccountStatus.INACTIVE,
    title: '',
    description: '',
  },
  {
    id: '3',
    balances: [
      {
        asset: { nationalCurrencyCode: NationalCurrencyCode.USD },
        availableAmount: '1',
        id: '1',
      },
    ],
    status: AccountStatus.ACTIVE,
    title: '',
    description: '',
  },
  {
    id: '4',
    balances: [
      {
        asset: { nationalCurrencyCode: NationalCurrencyCode.USD },
        availableAmount: '1',
        id: '1',
      },
    ],
    status: AccountStatus.ACTIVE,
    title: '',
    description: '',
  },
  {
    id: '5',
    balances: [
      {
        asset: { nationalCurrencyCode: NationalCurrencyCode.USD },
        availableAmount: '1',
        id: '1',
      },
    ],
    status: AccountStatus.ACTIVE,
    title: '',
    description: '',
  },
];

export function getSubAccount(accountId: string): Account | undefined {
  return ACCOUNTS.find((account) => account.id === accountId);
}

export function isKnownSubAccount(accountId: string): boolean {
  return ACCOUNTS.some((account) => account.id === accountId);
}

export function omitBalancesFromAccountList(accounts: Account[]): Account[] {
  return accounts.map((account) => omitBalancesFromAccount(account));
}

export function omitBalancesFromAccount(account: Account): Account {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { balances, ...accountWithoutBalances } = account;
  return accountWithoutBalances;
}
