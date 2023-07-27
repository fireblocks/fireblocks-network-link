import { FastifyReply, FastifyRequest } from 'fastify';
import {
  Account,
  AccountBalancesQueryParam,
  ErrorType,
  SubAccountIdPathParam,
} from '../../client/generated';
import {
  ENDING_STARTING_COMBINATION_ERROR,
  InvalidPaginationParamsCombinationError,
  PaginationParams,
  getPaginationResult,
} from '../controllers/pagination-controller';
import {
  ACCOUNTS,
  getSubAccount,
  omitBalancesFromAccount,
  omitBalancesFromAccountList,
} from '../controllers/accounts-controller';
import logger from '../../logging';

const log = logger('handler:accounts');

const ACCOUNT_NOT_FOUND_ERROR = {
  message: 'Account not found',
  errorType: ErrorType.NOT_FOUND,
};

export async function getAccounts(
  request: FastifyRequest,
  reply: FastifyReply
): Promise<{ accounts: Partial<Account>[] }> {
  const requestQuery = request.query as PaginationParams & {
    balances?: AccountBalancesQueryParam;
  };

  try {
    let page = getPaginationResult(
      requestQuery.limit,
      requestQuery.startingAfter,
      requestQuery.endingBefore,
      ACCOUNTS,
      'id'
    );

    if (!requestQuery.balances) {
      page = omitBalancesFromAccountList(page);
    }
    return { accounts: page };
  } catch (err) {
    if (err instanceof InvalidPaginationParamsCombinationError) {
      return reply.code(400).send(ENDING_STARTING_COMBINATION_ERROR);
    }
    throw err;
  }
}

export async function getAccountDetails(
  request: FastifyRequest,
  reply: FastifyReply
): Promise<Account> {
  const { accountId } = request.params as { accountId: SubAccountIdPathParam };
  const query = request.query as { balances?: AccountBalancesQueryParam };
  let account = getSubAccount(accountId);

  if (!account) {
    return reply.code(404).send(ACCOUNT_NOT_FOUND_ERROR);
  }

  if (!query.balances) {
    account = omitBalancesFromAccount(account);
  }

  return account;
}
