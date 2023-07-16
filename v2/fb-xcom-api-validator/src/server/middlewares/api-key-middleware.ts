import logger from '../../logging';
import { IncomingHttpHeaders } from 'http';
import { FastifyReply, FastifyRequest, HookHandlerDoneFunction } from 'fastify';
import config from '../../config';
import { RequestPart, UnauthorizedError } from '../../client/generated';

const log = logger('middleware:api-key');

const INVALID_API_KEY_ERROR: UnauthorizedError = {
  message: 'Provided API key is not authorized',
  errorType: UnauthorizedError.errorType.SCHEMA_PROPERTY_ERROR,
  propertyName: 'X-FBAPI-KEY',
  requestPart: RequestPart.HEADERS,
};

export function apiKeyMiddleware(
  request: FastifyRequest,
  reply: FastifyReply,
  done: HookHandlerDoneFunction
): void {
  const apiKey = getApiKeyFromHeaders(request.headers);

  const isValid = isApiKeyValid(apiKey);

  if (!isValid) {
    reply.code(401).send(INVALID_API_KEY_ERROR);
    return;
  }

  done();
}

function getApiKeyFromHeaders(headers: IncomingHttpHeaders): string {
  return String(headers['x-fbapi-key']);
}

function isApiKeyValid(apiKey): boolean {
  const configuredApiKey = config.get('authentication').apiKey;
  return apiKey === configuredApiKey;
}
