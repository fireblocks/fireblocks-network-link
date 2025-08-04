import * as ErrorFactory from '../http-error-factory';
import { FastifyReply, FastifyRequest } from 'fastify';
import { AccountsController, AccountNotExistError } from '../controllers/accounts-controller';
import { getPaginationResult } from '../controllers/pagination-controller';
import { AccountIdPathParam, PaginationQuerystring } from './request-types';
import { Account, AccountBalancesQueryParam, AccountRate, AssetCode } from '../../client/generated';

type AccountsResponse = { accounts: Account[] };
type IncludeBalancesQuerystring = {
  Querystring: {
    balances?: AccountBalancesQueryParam;
  };
};

type AccountRateQuerystring = {
  Querystring: {
    baseAsset: AssetCode;
    quoteAsset: AssetCode;
  };
};

function omitBalancesFromAccountList(accounts: Account[]): Account[] {
  return accounts.map((account) => omitBalancesFromAccount(account));
}

function omitBalancesFromAccount(account: Account): Account {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { balances, ...accountWithoutBalances } = account;
  return accountWithoutBalances;
}

export async function getAccounts(
  request: FastifyRequest<PaginationQuerystring & IncludeBalancesQuerystring>
): Promise<AccountsResponse> {
  const { limit, startingAfter, endingBefore, balances } = request.query;

  let page = getPaginationResult(
    limit,
    startingAfter,
    endingBefore,
    AccountsController.getAllSubAccounts(),
    'id'
  );

  if (!balances) {
    page = omitBalancesFromAccountList(page);
  }
  return { accounts: page };
}

export async function getAccountDetails(
  request: FastifyRequest<IncludeBalancesQuerystring & AccountIdPathParam>,
  reply: FastifyReply
): Promise<Account> {
  const { accountId } = request.params;
  const query = request.query;
  let account = AccountsController.getSubAccount(accountId);

  if (!account) {
    return ErrorFactory.notFound(reply);
  }

  if (!query.balances) {
    account = omitBalancesFromAccount(account);
  }

  return account;
}

export async function getAccountRate(
  request: FastifyRequest<AccountRateQuerystring & AccountIdPathParam>,
  reply: FastifyReply
): Promise<AccountRate> {
  const { accountId } = request.params;
  const { baseAsset, quoteAsset } = request.query;

  try {
    const accountRate = AccountsController.getAccountRate(accountId, baseAsset, quoteAsset);
    return accountRate;
  } catch (error) {
    if (error instanceof AccountNotExistError) {
      return ErrorFactory.notFound(reply);
    }
    throw error;
  }
}
