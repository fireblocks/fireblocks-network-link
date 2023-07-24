import { FastifyReply, FastifyRequest } from 'fastify';
import {
  Account,
  AccountBalancesQueryParam,
  AccountStatus,
  Balances,
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
  omitBalancesFromAccount,
  omitBalancesFromAccountList,
} from '../controllers/accounts-controller';

const ACCOUNT_NOT_FOUND_ERROR = {
  message: 'Account not found',
  errorType: ErrorType.NOT_FOUND,
};

const BALANCES: Balances = [];

const ACCOUNTS: Account[] = [
  { id: '1', balances: BALANCES, status: AccountStatus.ACTIVE, title: '', description: '' },
  { id: '2', balances: BALANCES, status: AccountStatus.INACTIVE, title: '', description: '' },
  { id: '3', balances: BALANCES, status: AccountStatus.ACTIVE, title: '', description: '' },
  { id: '4', balances: BALANCES, status: AccountStatus.ACTIVE, title: '', description: '' },
  { id: '5', balances: BALANCES, status: AccountStatus.ACTIVE, title: '', description: '' },
];

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
    return reply.code(500).send({ errorType: ErrorType.UNEXPECTED_ERROR });
  }
}

export async function getAccountDetails(
  request: FastifyRequest,
  reply: FastifyReply
): Promise<Account> {
  const params = request.params as { accountId: SubAccountIdPathParam };
  const query = request.query as { balances?: AccountBalancesQueryParam };
  let account = ACCOUNTS.find((account) => account.id === params.accountId);

  if (!account) {
    return reply.code(404).send(ACCOUNT_NOT_FOUND_ERROR);
  }

  if (!query.balances) {
    account = omitBalancesFromAccount(account);
  }

  return account;
}
