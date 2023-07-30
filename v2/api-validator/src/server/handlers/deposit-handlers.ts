import { FastifyReply, FastifyRequest } from 'fastify';
import { DepositCapability, SubAccountIdPathParam } from '../../client/generated';
import { PaginationParams, getPaginationResult } from '../controllers/pagination-controller';
import { DEPOSIT_METHODS } from '../controllers/deposit-controller';
import { isKnownSubAccount } from '../controllers/accounts-controller';
import * as ErrorFactory from '../http-error-factory';

export async function getDepositMethods(
  request: FastifyRequest,
  reply: FastifyReply
): Promise<{ capabilities: DepositCapability[] }> {
  const { limit, startingAfter, endingBefore } = request.query as PaginationParams;
  const { accountId } = request.params as { accountId: SubAccountIdPathParam };

  if (!isKnownSubAccount(accountId)) {
    return ErrorFactory.notFound(reply);
  }

  return {
    capabilities: getPaginationResult(limit, startingAfter, endingBefore, DEPOSIT_METHODS, 'id'),
  };
}
