import * as ErrorFactory from '../http-error-factory';
import { FastifyReply, FastifyRequest } from 'fastify';
import { Account, AccountBalancesQueryParam, SubAccountIdPathParam } from '../../client/generated';
import { getPaginationResult, PaginationParams } from '../controllers/pagination-controller';
import logger from '../../logging';
import { accountsController } from '../controllers/accounts-controller';

const log = logger('handler:accounts');

export async function getAccounts(
  request: FastifyRequest,
  reply: FastifyReply
): Promise<{ accounts: Partial<Account>[] }> {
  const { limit, startingAfter, endingBefore, balances } = request.query as PaginationParams & {
    balances?: AccountBalancesQueryParam;
  };

  let page = getPaginationResult(
    limit,
    startingAfter,
    endingBefore,
    accountsController.getAllSubAccounts(),
    'id'
  );

  if (!balances) {
    page = accountsController.omitBalancesFromAccountList(page);
  }
  return { accounts: page };
}

export async function getAccountDetails(
  request: FastifyRequest,
  reply: FastifyReply
): Promise<Account> {
  const { accountId } = request.params as { accountId: SubAccountIdPathParam };
  const query = request.query as { balances?: AccountBalancesQueryParam };
  let account = accountsController.getSubAccount(accountId);

  if (!account) {
    return ErrorFactory.notFound(reply);
  }

  if (!query.balances) {
    account = accountsController.omitBalancesFromAccount(account);
  }

  return account;
}
