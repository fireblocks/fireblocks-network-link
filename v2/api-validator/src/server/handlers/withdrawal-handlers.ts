import { FastifyReply, FastifyRequest } from 'fastify';
import {
  ListOrderQueryParam,
  SubAccountIdPathParam,
  Withdrawal,
  WithdrawalCapability,
} from '../../client/generated';
import { PaginationParams, getPaginationResult } from '../controllers/pagination-controller';
import { WITHDRAWALS, WITHDRAWAL_METHODS } from '../controllers/withdrawal-controller';
import { isKnownSubAccount } from '../controllers/accounts-controller';
import * as ErrorFactory from '../http-error-factory';

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
      WITHDRAWALS,
      'createdAt',
      order
    ),
  };
}
