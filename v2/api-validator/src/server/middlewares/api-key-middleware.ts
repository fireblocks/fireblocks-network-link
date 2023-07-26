import { IncomingHttpHeaders } from 'http';
import { FastifyReply, FastifyRequest, HookHandlerDoneFunction } from 'fastify';
import config from '../../config';
import { UnauthorizedError } from '../../client/generated';

const INVALID_API_KEY_ERROR: UnauthorizedError = {
  message: 'Provided API key is not authorized',
  errorType: UnauthorizedError.errorType.UNAUTHORIZED,
  propertyName: UnauthorizedError.propertyName.X_FBAPI_KEY,
  requestPart: UnauthorizedError.requestPart.HEADERS,
};

export function apiKeyMiddleware(
  request: FastifyRequest,
  reply: FastifyReply,
  done: HookHandlerDoneFunction
): void {
  const apiKey = getApiKeyFromHeaders(request.headers);

  if (!isApiKeyValid(apiKey)) {
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
