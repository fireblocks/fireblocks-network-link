import { FastifyReply, FastifyRequest, HookHandlerDoneFunction } from 'fastify';
import logger from '../../logging';
import { AuthProvider, HTTPMethod, MissingAuthHeaders } from '../../auth-provider';
import { InvalidSignatureError } from '../../signing';

const log = logger('handler:auth');

export function authMiddleware(request: FastifyRequest, reply: FastifyReply, done: HookHandlerDoneFunction) {
  
  // TODO: validate nonce wasn't used
  // TODO: validate time passed since timestamp
  try {
    const body = request.body;
    const method = request.method;
    const url = request.url;

    const { timestamp, nonce, signature, apiKey } = getAuthHeaders(request.raw.rawHeaders);

    validateAuthHeaders(timestamp, nonce, signature, apiKey);
    
    AuthProvider.getInstance().verifySignature(method as HTTPMethod, url, body, timestamp, nonce, signature);

  } catch (err) {
    if (err instanceof MissingAuthHeaders) {
      log.debug("Missing one or more auth headers in request: " + request.raw.rawHeaders);
      return reply.code(401).send(err.responseObject);
    } else if (err instanceof InvalidSignatureError) {
      log.debug("Invalid signature in request");
      return reply.code(401).send(err.responseObject);
    }
    return reply.code(500).send();
  }

  done();
}

function getAuthHeaders(headers: string[]) {
  const getHeader = (headerName: string): string => {
    const headerNameIndex = headers.findIndex(header => header === headerName);
    const headerValueIndex = headerNameIndex + 1
    return headers[headerValueIndex];
  }

  const timestamp = Number(getHeader("X-FBAPI-TIMESTAMP"));
  const nonce = String(getHeader("X-FBAPI-NONCE"));
  const signature = String(getHeader("X-FBAPI-SIGNATURE"));
  const apiKey = String(getHeader("X-FBAPI-KEY"));
  return { timestamp, nonce, signature, apiKey };
}

function validateAuthHeaders(timestamp: number, nonce: string, signature: string, apiKey: string) {
  if (!timestamp) {
    throw new MissingAuthHeaders("timestamp");
  }
  if (!nonce) {
    throw new MissingAuthHeaders("nonce");
  }
  if (!signature) {
    throw new MissingAuthHeaders("signature");
  }
  if (!apiKey) {
    throw new MissingAuthHeaders("key");
  }
}