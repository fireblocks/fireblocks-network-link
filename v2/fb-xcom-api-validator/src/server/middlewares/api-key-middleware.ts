import logger from '../../logging';
import { IncomingHttpHeaders } from 'http';
import { FastifyReply, FastifyRequest, HookHandlerDoneFunction } from 'fastify';
import config from '../../config';

const log = logger('middleware:api-key');

export function apiKeyMiddleware(
  request: FastifyRequest,
  reply: FastifyReply,
  done: HookHandlerDoneFunction
): void {
  const apiKey = getApiKeyFromHeaders(request.headers);

  const isValid = isApiKeyValid(apiKey);

  if (!isValid) {
    reply.code(401).send();
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
