import logger from '../../logging';
import { IncomingHttpHeaders } from 'http';
import { FastifyReply, FastifyRequest, HookHandlerDoneFunction } from 'fastify';
import { BadRequestError, RequestPart } from '../../client/generated';

const log = logger('middleware:nonce');

const usedNoncesForApiKeyMap = new Map<string, Set<string>>();

const NONCE_USED_ERROR: BadRequestError = {
  message: 'Provided nonce was received in a prior request',
  errorType: BadRequestError.errorType.SCHEMA_PROPERTY_ERROR,
  propertyName: 'X-FBAPI-NONCE',
  requestPart: RequestPart.HEADERS,
};

export function nonceMiddleware(
  request: FastifyRequest,
  reply: FastifyReply,
  done: HookHandlerDoneFunction
): void {
  const { apiKey, nonce } = getNonceHeaders(request.headers);

  const isUsed = isNonceUsed(apiKey, nonce);

  if (isUsed) {
    reply.code(400).send(NONCE_USED_ERROR);
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
  return !!usedNonces?.has(nonce);
}

function registerNonce(apiKey: string, nonce: string): void {
  const usedNonces = usedNoncesForApiKeyMap.get(apiKey);

  if (usedNonces) {
    usedNonces.add(nonce);
    return;
  }

  const initialNonceSet = new Set<string>();
  initialNonceSet.add(nonce);
  usedNoncesForApiKeyMap.set(apiKey, initialNonceSet);
}
