import { FastifyReply, FastifyRequest } from 'fastify';
import { ErrorType, Quote } from '../../client/generated';

export async function createQuote(request: FastifyRequest, reply: FastifyReply): Promise<Quote> {
  return reply.code(404).send({
    message: 'Entity not found',
    errorType: ErrorType.NOT_FOUND,
  });
}
