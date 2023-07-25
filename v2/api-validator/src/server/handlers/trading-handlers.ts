import { FastifyReply, FastifyRequest } from 'fastify';
import { ErrorType, Order } from '../../client/generated';

export async function createOrder(request: FastifyRequest, reply: FastifyReply): Promise<Order> {
  return reply.code(404).send({
    message: 'Entity not found',
    errorType: ErrorType.NOT_FOUND,
  });
}
