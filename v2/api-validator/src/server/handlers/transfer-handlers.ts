import { FastifyReply, FastifyRequest } from 'fastify';
import { BlockchainWithdrawal, ErrorType } from '../../client/generated';

export async function createBlockchainWithdrawal(
  request: FastifyRequest,
  reply: FastifyReply
): Promise<BlockchainWithdrawal> {
  return reply.code(404).send({
    message: 'Entity not found',
    errorType: ErrorType.NOT_FOUND,
  });
}
