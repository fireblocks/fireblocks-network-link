import { FastifyReply } from 'fastify';
import { GeneralError } from '../client/generated';

export function notFound(reply: FastifyReply): FastifyReply {
  const errorData: GeneralError = {
    message: 'Entity not found',
    errorType: GeneralError.errorType.NOT_FOUND,
  };
  return reply.code(404).send(errorData);
}
