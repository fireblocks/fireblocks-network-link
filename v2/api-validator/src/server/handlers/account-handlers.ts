import * as ErrorFactory from '../http-error-factory';
import { FastifyReply, FastifyRequest } from 'fastify';
import { AccountsController } from '../controllers/accounts-controller';
import { getPaginationResult } from '../controllers/pagination-controller';
import { AccountIdPathParam, PaginationQuerystring } from './request-types';
import { Account, AccountBalancesQueryParam } from '../../client/generated';

type AccountsResponse = { accounts: Account[] };
type IncludeBalancesQuerystring = {
  Querystring: {
    balances?: AccountBalancesQueryParam;
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
