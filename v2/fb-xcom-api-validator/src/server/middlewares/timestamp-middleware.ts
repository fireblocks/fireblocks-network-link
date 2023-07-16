import logger from '../../logging';
import { IncomingHttpHeaders } from 'http';
import { FastifyReply, FastifyRequest, HookHandlerDoneFunction } from 'fastify';
import config from '../../config';

const log = logger('middleware:timestamp');

export function timestampMiddleware(
  request: FastifyRequest,
  reply: FastifyReply,
  done: HookHandlerDoneFunction
): void {
  const timestamp = getTimestampFromHeaders(request.headers);

  const expired = isExpired(timestamp);

  if (expired) {
    reply.code(400).send({ errorCode: 'request-expired' });
    return;
  }

  done();
}

function getTimestampFromHeaders(headers: IncomingHttpHeaders): number {
  return Number(headers['x-fbapi-timestamp']);
}

function isExpired(timestamp: number): boolean {
  const requestTTLInSeconds = config.get('authentication').requestTTL;
  const oldestAllowed = Date.now() - requestTTLInSeconds * 1000;
  return timestamp < oldestAllowed;
}
