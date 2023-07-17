import logger from '../../logging';
import { IncomingHttpHeaders } from 'http';
import { verifySignature } from '../../security';
import { FastifyReply, FastifyRequest, HookHandlerDoneFunction } from 'fastify';
import { BadRequestError, RequestPart } from '../../client/generated';

const log = logger('middleware:verify-signature');

const INVALID_SIGNATURE_ERROR: BadRequestError = {
  message: 'Provided signature is invalid',
  errorType: BadRequestError.errorType.SCHEMA_PROPERTY_ERROR,
  propertyName: 'X-FBAPI-SIGNATURE',
  requestPart: RequestPart.HEADERS,
};

export function verifySignatureMiddleware(
  request: FastifyRequest,
  reply: FastifyReply,
  done: HookHandlerDoneFunction
): void {
  const body = request.body;
  const method = request.method;
  const url = request.url;

  const { timestamp, nonce, signature } = getSignatureHeaders(request.headers);

  const payload = buildSignaturePayload(method, url, body as object, timestamp, nonce);

  const isValid = verifySignature(payload, signature);

  if (!isValid) {
    reply.code(400).send(INVALID_SIGNATURE_ERROR);
    return;
  }

  done();
}

function getSignatureHeaders(headers: IncomingHttpHeaders) {
  const timestamp = Number(headers['x-fbapi-timestamp']);
  const nonce = String(headers['x-fbapi-nonce']);
  const signature = String(headers['x-fbapi-signature']);
  return { timestamp, nonce, signature };
}

/**
 * Builds the payload to sign from the request components
 */
function buildSignaturePayload(
  method: string,
  endpoint: string,
  body: object,
  timestamp: number,
  nonce: string
): string {
  return `${timestamp}${nonce}${method.toUpperCase()}${endpoint}${stringifyBody(body)}`;
}

function stringifyBody(body): string {
  if (!body) {
    return '';
  }
  return JSON.stringify(body);
}
