import * as ErrorFactory from '../http-error-factory';
import { FastifyReply, FastifyRequest } from 'fastify';
import { BlockchainWithdrawal } from '../../client/generated';

export async function createBlockchainWithdrawal(
  request: FastifyRequest,
  reply: FastifyReply
): Promise<BlockchainWithdrawal> {
  return ErrorFactory.notFound(reply);
}
