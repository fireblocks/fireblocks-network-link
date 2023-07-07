import { FastifyInstance, FastifyReply, FastifyRequest, HookHandlerDoneFunction, preHandlerHookHandler } from 'fastify';
import logger from '../../logging';
import { AuthProvider, HTTPMethod } from '../../auth-provider';
import { InvalidSignatureError } from '../../signing';
import config from '../../config';

const FBAPI_TIMESTAMP_HEADER = "X-FBAPI-TIMESTAMP";
const FBAPI_NONCE_HEADER = "X-FBAPI-NONCE";
const FBAPI_SIGNATURE_HEADER= "X-FBAPI-SIGNATURE";

const log = logger('handler:auth');
export function authMiddleware(this: FastifyInstance, request: FastifyRequest, reply: FastifyReply, done: HookHandlerDoneFunction) {
  const authConfig = config.get('auth');
  
  // TODO: verify nonce wasn't used
  // TODO: verify time passed since timestamp
  try {
    // verify signature
    const body = request.body;
    const method = request.method;
    const url = request.url;
    const timestamp = Number(request.headers[FBAPI_TIMESTAMP_HEADER]);
    const nonce = String(request.headers[FBAPI_NONCE_HEADER]);
    const signature = String(request.headers[FBAPI_SIGNATURE_HEADER]);

    AuthProvider.getInstance().verifySignature(method as HTTPMethod, url, body, timestamp, nonce, signature, authConfig.signing.publicKey);

  } catch (err) {
    if (err instanceof InvalidSignatureError) {
      return reply.code(401).send();
    }
    return reply.code(500).send();
  }

  done();
}