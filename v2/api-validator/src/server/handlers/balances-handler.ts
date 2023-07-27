import * as ErrorFactory from '../http-error-factory';
import { FastifyReply, FastifyRequest } from 'fastify';
import { isKnownSubAccount } from '../controllers/accounts-controller';
import { BalanceCapability, Balances, EntityIdPathParam } from '../../client/generated';
import { PaginationParams, getPaginationResult } from '../controllers/pagination-controller';
import { BALANCE_CAPABILITIES, getSubAccountBalances } from '../controllers/balances-controller';

export async function getBalanceAssets(
  request: FastifyRequest,
  reply: FastifyReply
): Promise<{ capabilities: BalanceCapability[] }> {
  const { limit, startingAfter, endingBefore } = request.query as PaginationParams;

  return {
    capabilities: getPaginationResult(
      limit,
      startingAfter,
      endingBefore,
      BALANCE_CAPABILITIES,
      'id'
    ),
  };
}

export async function getBalances(
  request: FastifyRequest,
  reply: FastifyReply
): Promise<{ balances: Balances }> {
  const { accountId } = request.params as { accountId: EntityIdPathParam };
  const { limit, startingAfter, endingBefore } = request.query as PaginationParams;

  if (!isKnownSubAccount(accountId)) {
    return ErrorFactory.notFound(reply);
  }

  return {
    balances: getPaginationResult(
      limit,
      startingAfter,
      endingBefore,
      getSubAccountBalances(accountId),
      'id'
    ),
  };
}

export async function getHistoricBalances(
  request: FastifyRequest,
  reply: FastifyReply
): Promise<{ balances: Balances }> {
  return getBalances(request, reply);
}
