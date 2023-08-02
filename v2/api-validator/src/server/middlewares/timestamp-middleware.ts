import { IncomingHttpHeaders } from 'http';
import { FastifyReply, FastifyRequest, HookHandlerDoneFunction } from 'fastify';
import config from '../../config';
import { BadRequestError, RequestPart } from '../../client/generated';

const EXPIRED_REQUEST_ERROR: BadRequestError = {
  message: 'Request timestamp header is too old',
  errorType: BadRequestError.errorType.SCHEMA_PROPERTY_ERROR,
  requestPart: RequestPart.HEADERS,
  propertyName: 'X-FBAPI-TIMESTAMP',
};

export function timestampMiddleware(
  request: FastifyRequest,
  reply: FastifyReply,
  done: HookHandlerDoneFunction
): void {
  const timestamp = getTimestampFromHeaders(request.headers);

  if (isExpired(timestamp)) {
    reply.code(400).send(EXPIRED_REQUEST_ERROR);
    return;
  }

  done();
}

function getTimestampFromHeaders(headers: IncomingHttpHeaders): number {
  return Number(headers['x-fbapi-timestamp']);
}

export function isExpired(timestamp: number): boolean {
  const requestTTLInSeconds = config.get('authentication').requestTTL;
  const oldestAllowed = Date.now() - requestTTLInSeconds * 1000;
  return timestamp < oldestAllowed;
}
