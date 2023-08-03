import { FastifyReply } from 'fastify';
import { BadRequestError, GeneralError } from '../client/generated';

export function notFound(reply: FastifyReply): FastifyReply {
  const errorData: GeneralError = {
    message: 'Entity not found',
    errorType: GeneralError.errorType.NOT_FOUND,
  };
  return reply.code(404).send(errorData);
}

export function badRequest(reply: FastifyReply, errorData: BadRequestError): FastifyReply {
  return reply.code(400).send(errorData);
}

export function orderNotTrading(reply: FastifyReply): FastifyReply {
  const errorData: BadRequestError = {
    message: 'Cannot cancel non active order',
    errorType: BadRequestError.errorType.ORDER_NOT_TRADING,
  };
  return reply.code(400).send(errorData);
}

export function idempotencyKeyReuse(reply: FastifyReply): FastifyReply {
  const errorData: BadRequestError = {
    message: 'Idempotency key has already been used for a different request',
    errorType: BadRequestError.errorType.IDEMPOTENCY_KEY_REUSE,
  };
  return reply.code(400).send(errorData);
}
