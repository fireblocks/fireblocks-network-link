import * as ErrorFactory from '../http-error-factory';
import { FastifyReply, FastifyRequest } from 'fastify';
import { isKnownSubAccount } from '../controllers/accounts-controller';
import { PaginationParams, getPaginationResult } from '../controllers/pagination-controller';
import {
  EntityIdPathParam,
  ListOrderQueryParam,
  SubAccountIdPathParam,
  Withdrawal,
  WithdrawalCapability,
} from '../../client/generated';
import {
  WITHDRAWAL_METHODS,
  getAccountBlockchainWithdrawals,
  getAccountFiatWithdrawals,
  getAccountPeerAccountWithdrawals,
  getAccountSubAccountWithdrawals,
  getAccountWithdrawals,
  getSingleAccountWithdrawal,
} from '../controllers/withdrawal-controller';

type AccountParam = { accountId: SubAccountIdPathParam };

export async function getWithdrawalMethods(
  request: FastifyRequest<{ Querystring: PaginationParams; Params: AccountParam }>,
  reply: FastifyReply
): Promise<{ capabilities: WithdrawalCapability[] }> {
  const { limit, startingAfter, endingBefore } = request.query;
  const { accountId } = request.params;

  if (!isKnownSubAccount(accountId)) {
    return ErrorFactory.notFound(reply);
  }

  return {
    capabilities: getPaginationResult(limit, startingAfter, endingBefore, WITHDRAWAL_METHODS, 'id'),
  };
}

export async function getWithdrawals(
  request: FastifyRequest<{
    Querystring: PaginationParams & { order: ListOrderQueryParam };
    Params: AccountParam;
  }>,
  reply: FastifyReply
): Promise<{ withdrawals: Withdrawal[] }> {
  const { limit, startingAfter, endingBefore, order } = request.query;
  const { accountId } = request.params;

  if (!isKnownSubAccount(accountId)) {
    return ErrorFactory.notFound(reply);
  }

  return {
    withdrawals: getPaginationResult(
      limit,
      startingAfter,
      endingBefore,
      getAccountWithdrawals(accountId),
      'createdAt',
      order
    ),
  };
}

export async function getWithdrawalDetails(
  request: FastifyRequest<{
    Params: AccountParam & { id: EntityIdPathParam };
  }>,
  reply: FastifyReply
): Promise<Withdrawal> {
  const { accountId, id: withdrawalId } = request.params;

  if (!isKnownSubAccount(accountId)) {
    return ErrorFactory.notFound(reply);
  }

  const withdrawal = getSingleAccountWithdrawal(accountId, withdrawalId);

  if (!withdrawal) {
    return ErrorFactory.notFound(reply);
  }

  return withdrawal;
}

export async function getSubAccountWithdrawals(
  request: FastifyRequest<{
    Querystring: PaginationParams & { order: ListOrderQueryParam };
    Params: AccountParam;
  }>,
  reply: FastifyReply
): Promise<{ withdrawals: Withdrawal[] }> {
  const { limit, startingAfter, endingBefore, order } = request.query;
  const { accountId } = request.params;

  if (!isKnownSubAccount(accountId)) {
    return ErrorFactory.notFound(reply);
  }

  return {
    withdrawals: getPaginationResult(
      limit,
      startingAfter,
      endingBefore,
      getAccountSubAccountWithdrawals(accountId),
      'createdAt',
      order
    ),
  };
}

export async function getPeerAccountWithdrawals(
  request: FastifyRequest<{
    Querystring: PaginationParams & { order: ListOrderQueryParam };
    Params: AccountParam;
  }>,
  reply: FastifyReply
): Promise<{ withdrawals: Withdrawal[] }> {
  const { limit, startingAfter, endingBefore, order } = request.query;
  const { accountId } = request.params;

  if (!isKnownSubAccount(accountId)) {
    return ErrorFactory.notFound(reply);
  }

  return {
    withdrawals: getPaginationResult(
      limit,
      startingAfter,
      endingBefore,
      getAccountPeerAccountWithdrawals(accountId),
      'createdAt',
      order
    ),
  };
}

export async function getBlockchainWithdrawals(
  request: FastifyRequest<{
    Querystring: PaginationParams & { order: ListOrderQueryParam };
    Params: AccountParam;
  }>,
  reply: FastifyReply
): Promise<{ withdrawals: Withdrawal[] }> {
  const { limit, startingAfter, endingBefore, order } = request.query;
  const { accountId } = request.params;

  if (!isKnownSubAccount(accountId)) {
    return ErrorFactory.notFound(reply);
  }

  return {
    withdrawals: getPaginationResult(
      limit,
      startingAfter,
      endingBefore,
      getAccountBlockchainWithdrawals(accountId),
      'createdAt',
      order
    ),
  };
}

export async function getFiatWithdrawals(
  request: FastifyRequest<{
    Querystring: PaginationParams & { order: ListOrderQueryParam };
    Params: AccountParam;
  }>,
  reply: FastifyReply
): Promise<{ withdrawals: Withdrawal[] }> {
  const { limit, startingAfter, endingBefore, order } = request.query;
  const { accountId } = request.params;

  if (!isKnownSubAccount(accountId)) {
    return ErrorFactory.notFound(reply);
  }

  return {
    withdrawals: getPaginationResult(
      limit,
      startingAfter,
      endingBefore,
      getAccountFiatWithdrawals(accountId),
      'createdAt',
      order
    ),
  };
}
