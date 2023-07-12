import { FastifyReply, FastifyRequest, HookHandlerDoneFunction } from 'fastify';
import logger from '../../logging';
import { HTTPMethod, verifySignature } from '../../security/auth-provider';
import { InvalidSignatureError } from '../../security/signing';
import { IncomingHttpHeaders } from 'http';

const log = logger('middleware:verify-signature');

export function verifySignatureMiddleware(request: FastifyRequest, reply: FastifyReply, done: HookHandlerDoneFunction) {
  try {
    const body = request.body;
    const method = request.method;
    const url = request.url;

    const { timestamp, nonce, signature } = getSignatureHeaders(request.headers);
    
    verifySignature(method as HTTPMethod, url, body, timestamp, nonce, signature);

  } catch (err) {
    if (err instanceof InvalidSignatureError) {
      log.debug("Invalid signature in request");
      return reply.code(401).send(err.responseObject);
    }
    return reply.code(500).send({ errorCode: "unexpected-error" });
  }

  done();
}

function getSignatureHeaders(headers: IncomingHttpHeaders) {
  const timestamp = Number(headers["x-fbapi-timestamp"])
  const nonce = String(headers["x-fbapi-nonce"])
  const signature = String(headers["x-fbapi-signature"]);
  return { timestamp, nonce, signature };
}