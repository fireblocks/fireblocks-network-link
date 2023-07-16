import logger from '../../logging';
import { IncomingHttpHeaders } from 'http';
import { FastifyReply, FastifyRequest, HookHandlerDoneFunction } from 'fastify';

const log = logger('middleware:nonce');

const usedNoncesForApiKeyMap = new Map<string, string[]>();

export function nonceMiddleware(
  request: FastifyRequest,
  reply: FastifyReply,
  done: HookHandlerDoneFunction
): void {
  const { apiKey, nonce } = getNonceHeaders(request.headers);

  const isUsed = isNonceUsed(apiKey, nonce);

  if (isUsed) {
    reply.code(400).send({ errorCode: 'nonce-already-used' });
    return;
  }

  registerNonce(apiKey, nonce);

  done();
}

function getNonceHeaders(headers: IncomingHttpHeaders) {
  const apiKey = String(headers['x-fbapi-key']);
  const nonce = String(headers['x-fbapi-nonce']);
  return { apiKey, nonce };
}

function isNonceUsed(apiKey: string, nonce: string): boolean {
  const usedNonces = usedNoncesForApiKeyMap.get(apiKey);
  return !!usedNonces?.find((usedNonce) => usedNonce === nonce);
}

function registerNonce(apiKey: string, nonce: string): void {
  const usedNonces = usedNoncesForApiKeyMap.get(apiKey);

  if (!usedNonces) {
    usedNoncesForApiKeyMap.set(apiKey, [nonce]);
    return;
  }

  usedNonces.push(nonce);
  usedNoncesForApiKeyMap.set(apiKey, usedNonces);
}
