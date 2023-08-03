import * as ErrorFactory from '../http-error-factory';
import { FastifyReply, FastifyRequest } from 'fastify';
import { isKnownSubAccount } from '../controllers/accounts-controller';
import { PaginationParams, getPaginationResult } from '../controllers/pagination-controller';
import {
  BlockchainWithdrawalRequest,
  CrossAccountWithdrawalRequest,
  EntityIdPathParam,
  FiatWithdrawalRequest,
  GeneralError,
  ListOrderQueryParam,
  SubAccountIdPathParam,
  Withdrawal,
  WithdrawalCapability,
} from '../../client/generated';
import {
  WITHDRAWAL_METHODS,
  WithdrawalRequest,
  createAccountBlockchainWithdrawal,
  createAccountFiatWithdrawal,
  createAccountPeerAccountWithdrawal,
  createAccountSubAccountWithdrawal,
  getAccountBlockchainWithdrawals,
  getAccountFiatWithdrawals,
  getAccountPeerAccountWithdrawals,
  getAccountSubAccountWithdrawals,
  getAccountWithdrawals,
  getSingleAccountWithdrawal,
  registerIdempotentResponse,
} from '../controllers/withdrawal-controller';
import { JsonValue } from 'type-fest';
import { IdempotencyMetadata, IdempotencyRequest } from '../controllers/deposit-controller';
import { IdempotencyKeyReuseError } from '../controllers/orders-controller';
import logger from '../../logging';

const log = logger('handler:withdrawal');

type AccountParam = { accountId: SubAccountIdPathParam };

/**
 * GET Endpoints
 */

export async function getWithdrawalMethods(
  request: FastifyRequest<{ Querystring: PaginationParams; Params: AccountParam }>,
  reply: FastifyReply
): Promise<{ capabilities: WithdrawalCapability[] }> {
  const { limit, startingAfter, endingBefore } = request.query;
  const { accountId } = request.params;

  if (!isKnownSubAccount(accountId)) {
    return ErrorFactory.notFound(reply);
  }

  return {
    capabilities: getPaginationResult(limit, startingAfter, endingBefore, WITHDRAWAL_METHODS, 'id'),
  };
}

export async function getWithdrawals(
  request: FastifyRequest<{
    Querystring: PaginationParams & { order: ListOrderQueryParam };
    Params: AccountParam;
  }>,
  reply: FastifyReply
): Promise<{ withdrawals: Withdrawal[] }> {
  const { limit, startingAfter, endingBefore, order } = request.query;
  const { accountId } = request.params;

  if (!isKnownSubAccount(accountId)) {
    return ErrorFactory.notFound(reply);
  }

  return {
    withdrawals: getPaginationResult(
      limit,
      startingAfter,
      endingBefore,
      getAccountWithdrawals(accountId),
      'createdAt',
      order
    ),
  };
}

export async function getWithdrawalDetails(
  request: FastifyRequest<{
    Params: AccountParam & { id: EntityIdPathParam };
  }>,
  reply: FastifyReply
): Promise<Withdrawal> {
  const { accountId, id: withdrawalId } = request.params;

  if (!isKnownSubAccount(accountId)) {
    return ErrorFactory.notFound(reply);
  }

  const withdrawal = getSingleAccountWithdrawal(accountId, withdrawalId);

  if (!withdrawal) {
    return ErrorFactory.notFound(reply);
  }

  return withdrawal;
}

export async function getSubAccountWithdrawals(
  request: FastifyRequest<{
    Querystring: PaginationParams & { order: ListOrderQueryParam };
    Params: AccountParam;
  }>,
  reply: FastifyReply
): Promise<{ withdrawals: Withdrawal[] }> {
  const { limit, startingAfter, endingBefore, order } = request.query;
  const { accountId } = request.params;

  if (!isKnownSubAccount(accountId)) {
    return ErrorFactory.notFound(reply);
  }

  return {
    withdrawals: getPaginationResult(
      limit,
      startingAfter,
      endingBefore,
      getAccountSubAccountWithdrawals(accountId),
      'createdAt',
      order
    ),
  };
}

export async function getPeerAccountWithdrawals(
  request: FastifyRequest<{
    Querystring: PaginationParams & { order: ListOrderQueryParam };
    Params: AccountParam;
  }>,
  reply: FastifyReply
): Promise<{ withdrawals: Withdrawal[] }> {
  const { limit, startingAfter, endingBefore, order } = request.query;
  const { accountId } = request.params;

  if (!isKnownSubAccount(accountId)) {
    return ErrorFactory.notFound(reply);
  }

  return {
    withdrawals: getPaginationResult(
      limit,
      startingAfter,
      endingBefore,
      getAccountPeerAccountWithdrawals(accountId),
      'createdAt',
      order
    ),
  };
}

export async function getBlockchainWithdrawals(
  request: FastifyRequest<{
    Querystring: PaginationParams & { order: ListOrderQueryParam };
    Params: AccountParam;
  }>,
  reply: FastifyReply
): Promise<{ withdrawals: Withdrawal[] }> {
  const { limit, startingAfter, endingBefore, order } = request.query;
  const { accountId } = request.params;

  if (!isKnownSubAccount(accountId)) {
    return ErrorFactory.notFound(reply);
  }

  return {
    withdrawals: getPaginationResult(
      limit,
      startingAfter,
      endingBefore,
      getAccountBlockchainWithdrawals(accountId),
      'createdAt',
      order
    ),
  };
}

export async function getFiatWithdrawals(
  request: FastifyRequest<{
    Querystring: PaginationParams & { order: ListOrderQueryParam };
    Params: AccountParam;
  }>,
  reply: FastifyReply
): Promise<{ withdrawals: Withdrawal[] }> {
  const { limit, startingAfter, endingBefore, order } = request.query;
  const { accountId } = request.params;

  if (!isKnownSubAccount(accountId)) {
    return ErrorFactory.notFound(reply);
  }

  return {
    withdrawals: getPaginationResult(
      limit,
      startingAfter,
      endingBefore,
      getAccountFiatWithdrawals(accountId),
      'createdAt',
      order
    ),
  };
}

/**
 * POST Endpoints
 */

export const SUB_ACCOUNT_WITHDRAWAL_IDEMPOTENCY_RESPONSE_MAP = new Map<
  string,
  Map<string, IdempotencyMetadata>
>();
export const PEER_ACCOUNT_WITHDRAWAL_IDEMPOTENCY_RESPONSE_MAP = new Map<
  string,
  Map<string, IdempotencyMetadata>
>();
export const BLOCKCHAIN_WITHDRAWAL_IDEMPOTENCY_RESPONSE_MAP = new Map<
  string,
  Map<string, IdempotencyMetadata>
>();
export const FIAT_WITHDRAWAL_IDEMPOTENCY_RESPONSE_MAP = new Map<
  string,
  Map<string, IdempotencyMetadata>
>();

export async function createSubAccountWithdrawal(
  request: FastifyRequest<{ Body: CrossAccountWithdrawalRequest; Params: AccountParam }>,
  reply: FastifyReply
): Promise<Withdrawal> {
  const { accountId } = request.params;

  const saveAndSendIdempotentResponse = (responseStatus: number, responseBody: JsonValue) => {
    registerIdempotentResponse(
      accountId,
      request.body.idempotencyKey,
      {
        requestBody: request.body,
        responseStatus,
        responseBody,
      },
      BLOCKCHAIN_WITHDRAWAL_IDEMPOTENCY_RESPONSE_MAP
    );
    return reply.code(responseStatus).send(responseBody);
  };

  if (!isKnownSubAccount(accountId)) {
    return ErrorFactory.notFound(reply);
  }

  try {
    const withdrawal = createAccountSubAccountWithdrawal(
      accountId,
      request.body,
      SUB_ACCOUNT_WITHDRAWAL_IDEMPOTENCY_RESPONSE_MAP
    );
    return saveAndSendIdempotentResponse(200, withdrawal);
  } catch (err) {
    if (err instanceof IdempotencyRequest) {
      return reply.code(err.metadata.responseStatus).send(err.metadata.responseBody);
    }
    if (err instanceof IdempotencyKeyReuseError) {
      return ErrorFactory.idempotencyKeyReuse(reply);
    }
    return saveAndSendIdempotentResponse(500, { errorType: GeneralError.errorType.INTERNAL_ERROR });
  }
}

export async function createPeerAccountWithdrawal(
  request: FastifyRequest<{ Body: CrossAccountWithdrawalRequest; Params: AccountParam }>,
  reply: FastifyReply
): Promise<Withdrawal> {
  const { accountId } = request.params;

  const saveAndSendIdempotentResponse = (responseStatus: number, responseBody: JsonValue) => {
    registerIdempotentResponse(
      accountId,
      request.body.idempotencyKey,
      {
        requestBody: request.body,
        responseStatus,
        responseBody,
      },
      BLOCKCHAIN_WITHDRAWAL_IDEMPOTENCY_RESPONSE_MAP
    );
    return reply.code(responseStatus).send(responseBody);
  };

  if (!isKnownSubAccount(accountId)) {
    return ErrorFactory.notFound(reply);
  }

  try {
    const withdrawal = createAccountPeerAccountWithdrawal(
      accountId,
      request.body,
      PEER_ACCOUNT_WITHDRAWAL_IDEMPOTENCY_RESPONSE_MAP
    );
    return saveAndSendIdempotentResponse(200, withdrawal);
  } catch (err) {
    if (err instanceof IdempotencyRequest) {
      return reply.code(err.metadata.responseStatus).send(err.metadata.responseBody);
    }
    if (err instanceof IdempotencyKeyReuseError) {
      return ErrorFactory.idempotencyKeyReuse(reply);
    }
    return saveAndSendIdempotentResponse(500, { errorType: GeneralError.errorType.INTERNAL_ERROR });
  }
}

export async function createBlockchainWithdrawal(
  request: FastifyRequest<{ Body: BlockchainWithdrawalRequest; Params: AccountParam }>,
  reply: FastifyReply
): Promise<Withdrawal> {
  const { accountId } = request.params;

  const saveAndSendIdempotentResponse = (responseStatus: number, responseBody: JsonValue) => {
    registerIdempotentResponse(
      accountId,
      request.body.idempotencyKey,
      {
        requestBody: request.body,
        responseStatus,
        responseBody,
      },
      BLOCKCHAIN_WITHDRAWAL_IDEMPOTENCY_RESPONSE_MAP
    );
    return reply.code(responseStatus).send(responseBody);
  };

  if (!isKnownSubAccount(accountId)) {
    return ErrorFactory.notFound(reply);
  }

  try {
    const withdrawal = createAccountBlockchainWithdrawal(
      accountId,
      request.body,
      BLOCKCHAIN_WITHDRAWAL_IDEMPOTENCY_RESPONSE_MAP
    );
    return saveAndSendIdempotentResponse(200, withdrawal);
  } catch (err) {
    if (err instanceof IdempotencyRequest) {
      return reply.code(err.metadata.responseStatus).send(err.metadata.responseBody);
    }
    if (err instanceof IdempotencyKeyReuseError) {
      return ErrorFactory.idempotencyKeyReuse(reply);
    }
    return saveAndSendIdempotentResponse(500, { errorType: GeneralError.errorType.INTERNAL_ERROR });
  }
}

export async function createFiatWithdrawal(
  request: FastifyRequest<{ Body: FiatWithdrawalRequest; Params: AccountParam }>,
  reply: FastifyReply
): Promise<Withdrawal> {
  const { accountId } = request.params;

  const saveAndSendIdempotentResponse = (responseStatus: number, responseBody: JsonValue) => {
    registerIdempotentResponse(
      accountId,
      request.body.idempotencyKey,
      {
        requestBody: request.body,
        responseStatus,
        responseBody,
      },
      BLOCKCHAIN_WITHDRAWAL_IDEMPOTENCY_RESPONSE_MAP
    );
    return reply.code(responseStatus).send(responseBody);
  };

  if (!isKnownSubAccount(accountId)) {
    return ErrorFactory.notFound(reply);
  }

  try {
    const withdrawal = createAccountFiatWithdrawal(
      accountId,
      request.body,
      FIAT_WITHDRAWAL_IDEMPOTENCY_RESPONSE_MAP
    );
    return saveAndSendIdempotentResponse(200, withdrawal);
  } catch (err) {
    if (err instanceof IdempotencyRequest) {
      return reply.code(err.metadata.responseStatus).send(err.metadata.responseBody);
    }
    if (err instanceof IdempotencyKeyReuseError) {
      return ErrorFactory.idempotencyKeyReuse(reply);
    }
    return saveAndSendIdempotentResponse(500, { errorType: GeneralError.errorType.INTERNAL_ERROR });
  }
}
