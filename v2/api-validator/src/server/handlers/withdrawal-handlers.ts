import { FastifyReply, FastifyRequest } from 'fastify';
import { SubAccountIdPathParam, WithdrawalCapability } from '../../client/generated';
import { PaginationParams, getPaginationResult } from '../controllers/pagination-controller';
import { WITHDRAWAL_METHODS } from '../controllers/withdrawal-controller';
import { accountsController } from '../controllers/accounts-controller';
import * as ErrorFactory from '../http-error-factory';

export async function getWithdrawalMethods(
  request: FastifyRequest,
  reply: FastifyReply
): Promise<{ capabilities: WithdrawalCapability[] }> {
  const { limit, startingAfter, endingBefore } = request.query as PaginationParams;
  const { accountId } = request.params as { accountId: SubAccountIdPathParam };

  if (!accountsController.isKnownSubAccount(accountId)) {
    return ErrorFactory.notFound(reply);
  }

  return {
    capabilities: getPaginationResult(limit, startingAfter, endingBefore, WITHDRAWAL_METHODS, 'id'),
  };
}
