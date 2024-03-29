import { IncomingHttpHeaders } from 'http';
import { FastifyReply, FastifyRequest, HookHandlerDoneFunction } from 'fastify';
import { BadRequestError, RequestPart } from '../../client/generated';

const usedNoncesForApiKeyMap = new Map<string, Set<string>>();

const NONCE_USED_ERROR: BadRequestError = {
  message: 'Provided nonce was already used',
  errorType: BadRequestError.errorType.SCHEMA_PROPERTY_ERROR,
  propertyName: 'X-FBAPI-NONCE',
  requestPart: RequestPart.HEADERS,
};

const INVALID_NONCE_ERROR: BadRequestError = {
  message: 'Nonce must be a non empty string',
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

  if (!isValidNonce(nonce)) {
    reply.code(400).send(INVALID_NONCE_ERROR);
    return;
  }

  if (isNonceUsed(apiKey, nonce, usedNoncesForApiKeyMap)) {
    reply.code(400).send(NONCE_USED_ERROR);
    return;
  }

  registerNonce(apiKey, nonce, usedNoncesForApiKeyMap);

  done();
}

function getNonceHeaders(headers: IncomingHttpHeaders) {
  const apiKey = String(headers['x-fbapi-key']);
  const nonce = String(headers['x-fbapi-nonce']);
  return { apiKey, nonce };
}

function isValidNonce(nonce: string): boolean {
  return !!nonce && typeof nonce === 'string';
}

export function isNonceUsed(
  apiKey: string,
  nonce: string,
  usedNoncesForApiKeyMap: Map<string, Set<string>>
): boolean {
  const usedNonces = usedNoncesForApiKeyMap.get(apiKey);
  return !!usedNonces?.has(nonce);
}

export function registerNonce(
  apiKey: string,
  nonce: string,
  usedNoncesForApiKeyMap: Map<string, Set<string>>
): void {
  const usedNonces = usedNoncesForApiKeyMap.get(apiKey);

  if (usedNonces) {
    usedNonces.add(nonce);
    return;
  }

  const initialNonceSet = new Set<string>();
  initialNonceSet.add(nonce);
  usedNoncesForApiKeyMap.set(apiKey, initialNonceSet);
}
