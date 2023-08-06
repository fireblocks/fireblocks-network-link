import { randomUUID } from 'crypto';
import { faker } from '@faker-js/faker';
import {
  IdempotencyHandler,
  IdempotentRequestAlreadyExists,
  NoPreviousIdempotentRequest,
} from '../../src/server/controllers/idempotency-handler';
import { BadRequestError } from '../../src/client/generated';

type Payload = { data: string };

type TestRequest = Payload & {
  idempotencyKey: string;
};

function makeRequest(): TestRequest {
  return {
    idempotencyKey: randomUUID(),
    data: faker.lorem.text(),
  };
}

function makeResponse(): Payload {
  return {
    data: faker.lorem.text(),
  };
}

describe('IdempotencyHandler', () => {
  const reply = {
    code: jest.fn(),
    send: jest.fn(),
  };

  let idempotencyHandler: IdempotencyHandler<TestRequest, Payload>;

  beforeEach(() => {
    reply.code = jest.fn(() => reply);
    reply.send = jest.fn(() => reply);

    idempotencyHandler = new IdempotencyHandler<TestRequest, Payload>();
  });

  describe('Add new request', () => {
    it('should contain the key after add', () => {
      const request = makeRequest();
      const response = makeResponse();

      expect(idempotencyHandler.isKnownKey(request.idempotencyKey)).toBeFalsy();
      idempotencyHandler.add(request, 200, response);
      expect(idempotencyHandler.isKnownKey(request.idempotencyKey)).toBeTruthy();
    });
  });

  describe('Reply to already known request', () => {
    it('should reply with the same response', () => {
      const request = makeRequest();
      const response = makeResponse();

      idempotencyHandler.add(request, 201, response);
      idempotencyHandler.reply(request, reply);
      expect(reply.code).toHaveBeenCalledWith(201);
      expect(reply.send).toHaveBeenCalledWith(response);
    });
  });

  describe('Ask to reply to an unknown request', () => {
    it('should throw NoPreviousIdempotentRequest', () => {
      const request = makeRequest();
      expect(() => idempotencyHandler.reply(request, reply)).toThrow(NoPreviousIdempotentRequest);
    });
  });

  describe('Ask to reply to a known key but a different request body', () => {
    it('should reply with idempotency key reuse error', () => {
      const request1 = makeRequest();
      const request2 = makeRequest();
      request2.idempotencyKey = request1.idempotencyKey;

      const response = makeResponse();
      idempotencyHandler.add(request1, 200, response);
      expect(idempotencyHandler.isKnownKey(request2.idempotencyKey)).toBeTruthy();

      idempotencyHandler.reply(request2, reply);
      expect(reply.code).toHaveBeenCalledWith(400);
      expect(reply.send).toHaveBeenCalledWith({
        message: 'Idempotency key has already been used for a different request',
        errorType: BadRequestError.errorType.IDEMPOTENCY_KEY_REUSE,
      });
    });
  });

  describe('Add already known request', () => {
    it('should throw IdempotentRequestAlreadyExists', () => {
      const request1 = makeRequest();
      const request2 = makeRequest();
      request2.idempotencyKey = request1.idempotencyKey;

      const response = makeResponse();
      idempotencyHandler.add(request1, 200, response);
      expect(() => idempotencyHandler.add(request2, 200, response)).toThrow(
        IdempotentRequestAlreadyExists
      );
    });
  });
});
