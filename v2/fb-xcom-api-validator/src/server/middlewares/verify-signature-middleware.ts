import logger from '../../logging';
import { IncomingHttpHeaders } from 'http';
import { verifySignature } from '../../security/auth-provider';
import { InvalidSignatureError } from '../../security/signing';
import { FastifyReply, FastifyRequest, HookHandlerDoneFunction } from 'fastify';

const log = logger('middleware:verify-signature');

export function verifySignatureMiddleware(
  request: FastifyRequest,
  reply: FastifyReply,
  done: HookHandlerDoneFunction
): void {
  try {
    const body = request.body;
    const method = request.method;
    const url = request.url;

    const { timestamp, nonce, signature } = getSignatureHeaders(request.headers);

    const payload = buildSignaturePayload(method, url, body as object, timestamp, nonce);

    verifySignature(payload, signature);
  } catch (err) {
    if (err instanceof InvalidSignatureError) {
      log.debug('Invalid signature in request');
      reply.code(401).send(err.responseObject);
      return;
    }
    reply.code(500).send({ errorCode: 'unexpected-error' });
    return;
  }

  done();
}

function getSignatureHeaders(headers: IncomingHttpHeaders) {
  const timestamp = Number(headers['x-fbapi-timestamp']);
  const nonce = String(headers['x-fbapi-nonce']);
  const signature = decodeURIComponent(String(headers['x-fbapi-signature']));
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
