import logger from '../../logging';
import { IncomingHttpHeaders } from 'http';
import { verifySignature } from '../../security/auth-provider';
import { InvalidSignatureError } from '../../security/signing';
import { FastifyReply, FastifyRequest, HTTPMethods, HookHandlerDoneFunction } from 'fastify';

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

    verifySignature(method as HTTPMethods, url, body, timestamp, nonce, signature);
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
