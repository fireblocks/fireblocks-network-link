import * as ErrorFactory from '../http-error-factory';
import { FastifyReply, FastifyRequest } from 'fastify';
import { Quote } from '../../client/generated';

export async function createQuote(request: FastifyRequest, reply: FastifyReply): Promise<Quote> {
  return ErrorFactory.notFound(reply);
}
