import * as ErrorFactory from '../http-error-factory';
import { FastifyReply, FastifyRequest } from 'fastify';
import {
  AccountsController,
  AccountNotExistError,
  RateBadRequestError,
} from '../controllers/accounts-controller';
import { getPaginationResult } from '../controllers/pagination-controller';
import { AccountIdPathParam, PaginationQuerystring } from './request-types';
import {
  Account,
  AccountBalancesQueryParam,
  OrderBookPairIdQueryParam,
  ConversionPairIdQueryParam,
  RampsPairIdQueryParam,
  Rate,
  BadRequestError,
} from '../../client/generated';

type AccountsResponse = { accounts: Account[] };
type IncludeBalancesQuerystring = {
  Querystring: {
    balances?: AccountBalancesQueryParam;
  };
};

type AccountRateQuerystring = {
  Querystring: {
    conversionPairId?: ConversionPairIdQueryParam;
    rampsPairId?: RampsPairIdQueryParam;
    orderBookPairId?: OrderBookPairIdQueryParam;
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

export async function getRateByAccountAndPairId(
  request: FastifyRequest<AccountRateQuerystring & AccountIdPathParam>,
  reply: FastifyReply
): Promise<Rate> {
  const { accountId } = request.params;
  const { conversionPairId, rampsPairId, orderBookPairId } = request.query;

  try {
    // First check if account exists
    const account = AccountsController.getSubAccount(accountId);
    if (!account) {
      return ErrorFactory.notFound(reply);
    }

    // Then validate pair IDs
    let pairId: string;
    let type: 'conversion' | 'ramps' | 'orderBook';

    if (conversionPairId && conversionPairId.trim() !== '') {
      pairId = conversionPairId;
      type = 'conversion';
    } else if (rampsPairId && rampsPairId.trim() !== '') {
      pairId = rampsPairId;
      type = 'ramps';
    } else if (orderBookPairId && orderBookPairId.trim() !== '') {
      pairId = orderBookPairId;
      type = 'orderBook';
    } else {
      const errorData: BadRequestError = {
        message: 'One of conversionPairId, rampsPairId, or orderBookPairId must be provided',
        errorType: BadRequestError.errorType.BAD_REQUEST,
      };
      return ErrorFactory.badRequest(reply, errorData);
    }

    const accountRate = AccountsController.getRateByPairId(accountId, pairId, type);
    return accountRate;
  } catch (error) {
    if (error instanceof AccountNotExistError) {
      return ErrorFactory.notFound(reply);
    }
    if (error instanceof RateBadRequestError) {
      const errorData: BadRequestError = {
        message: 'Rate pair id is required',
        errorType: BadRequestError.errorType.BAD_REQUEST,
      };
      return ErrorFactory.badRequest(reply, errorData);
    }
    throw error;
  }
}
