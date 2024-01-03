import _ from 'lodash';
import { JsonValue } from 'type-fest';
import { IncomingHttpHeaders } from 'http';
import { verifySignature } from '../../security';
import { FastifyReply, FastifyRequest, HookHandlerDoneFunction } from 'fastify';
import { BadRequestError, RequestPart } from '../../client/generated';
import config from '../../config';

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
  const body = request.body as JsonValue;
  const method = request.method;
  const url = removeUrlPrefix(request.url);

  const { timestamp, nonce, signature } = getSignatureHeaders(request.headers);

  const payload = buildSignaturePayload(method, url, body, timestamp, nonce);

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

function removeUrlPrefix(url: string) {
  const prefix = config.getServerUrlPrefix();
  return url.replace(prefix, '');
}

/**
 * Builds the payload to sign from the request components
 */
function buildSignaturePayload(
  method: string,
  endpoint: string,
  body: JsonValue,
  timestamp: number,
  nonce: string
): string {
  return `${timestamp}${nonce}${method.toUpperCase()}${endpoint}${stringifyBody(body)}`;
}

function stringifyBody(body: JsonValue): string {
  if (_.isEmpty(body)) {
    return '';
  }
  return JSON.stringify(body);
}
