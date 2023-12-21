import _ from 'lodash';
import { XComError } from '../../error';
import { BadRequestError } from '../../client/generated';

type IdempotencyKey = string;
export type IdempotentRequest = {
  idempotencyKey: IdempotencyKey;
};

export type Replier<T> = {
  code: (statusCode: number) => T;
  send: (responseBody: any) => T;
};

export class IdempotencyHandler<RequestBody extends IdempotentRequest, ResponseBody> {
  private readonly requests = new Map<
    IdempotencyKey,
    { request: RequestBody; statusCode: number; response: ResponseBody }
  >();

  public isKnownKey(idempotencyKey: IdempotencyKey): boolean {
    return this.requests.has(idempotencyKey);
  }

  public reply<R extends Replier<R>>(request: RequestBody, reply: R): R {
    const previousRequest = this.requests.get(request.idempotencyKey);
    if (!previousRequest) {
      throw new NoPreviousIdempotentRequest();
    }

    if (!_.isEqual(request, previousRequest.request)) {
      const errorData: BadRequestError = {
        message: 'Idempotency key has already been used for a different request',
        errorType: BadRequestError.errorType.IDEMPOTENCY_KEY_REUSE,
      };
      return reply.code(400).send(errorData);
    }

    return reply.code(previousRequest.statusCode).send(previousRequest.response);
  }

  public add(request: RequestBody, statusCode: number, response: ResponseBody): void {
    if (this.requests.has(request.idempotencyKey)) {
      throw new IdempotentRequestAlreadyExists();
    }

    this.requests.set(request.idempotencyKey, { request, statusCode, response });
  }
}

export class NoPreviousIdempotentRequest extends XComError {
  constructor() {
    super('No previous idempotent request');
  }
}

export class IdempotentRequestAlreadyExists extends XComError {
  constructor() {
    super('Idempotent request already exists');
  }
}
