import * as ErrorFactory from '../http-error-factory';
import { FastifyReply, FastifyRequest } from 'fastify';
import { IdempotencyHandler } from '../controllers/idempotency-handler';
import { PaginationParams, getPaginationResult } from '../controllers/pagination-controller';
import {
  WITHDRAWALS,
  WITHDRAWAL_METHODS,
  WithdrawalController,
  WithdrawalNotFoundError,
} from '../controllers/withdrawal-controller';
import {
  BlockchainWithdrawalRequest,
  CrossAccountWithdrawalRequest,
  EntityIdPathParam,
  FiatWithdrawalRequest,
  ListOrderQueryParam,
  SubAccountIdPathParam,
  Withdrawal,
  WithdrawalCapability,
} from '../../client/generated';
import { ControllersContainer } from '../controllers/controllers-container';

type AccountParam = { accountId: SubAccountIdPathParam };

const controllers = new ControllersContainer(() => new WithdrawalController(WITHDRAWALS));

/**
 * GET Endpoints
 */

export async function getWithdrawalMethods(
  request: FastifyRequest<{ Querystring: PaginationParams; Params: AccountParam }>,
  reply: FastifyReply
): Promise<{ capabilities: WithdrawalCapability[] }> {
  const { limit, startingAfter, endingBefore } = request.query;
  const { accountId } = request.params;

  const controller = controllers.getController(accountId);
  if (!controller) {
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

  const controller = controllers.getController(accountId);
  if (!controller) {
    return ErrorFactory.notFound(reply);
  }

  return {
    withdrawals: getPaginationResult(
      limit,
      startingAfter,
      endingBefore,
      controller.getAccountWithdrawals(order),
      'id'
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

  const controller = controllers.getController(accountId);
  if (!controller) {
    return ErrorFactory.notFound(reply);
  }

  try {
    return controller.getAccountWithdrawal(withdrawalId);
  } catch (err) {
    if (err instanceof WithdrawalNotFoundError) {
      return ErrorFactory.notFound(reply);
    }
    throw err;
  }
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

  const controller = controllers.getController(accountId);
  if (!controller) {
    return ErrorFactory.notFound(reply);
  }

  return {
    withdrawals: getPaginationResult(
      limit,
      startingAfter,
      endingBefore,
      controller.getAccountSubAccountWithdrawals(order),
      'id'
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

  const controller = controllers.getController(accountId);
  if (!controller) {
    return ErrorFactory.notFound(reply);
  }

  return {
    withdrawals: getPaginationResult(
      limit,
      startingAfter,
      endingBefore,
      controller.getAccountPeerAccountWithdrawals(order),
      'id'
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

  const controller = controllers.getController(accountId);
  if (!controller) {
    return ErrorFactory.notFound(reply);
  }

  return {
    withdrawals: getPaginationResult(
      limit,
      startingAfter,
      endingBefore,
      controller.getAccountBlockchainWithdrawals(order),
      'id'
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

  const controller = controllers.getController(accountId);
  if (!controller) {
    return ErrorFactory.notFound(reply);
  }

  return {
    withdrawals: getPaginationResult(
      limit,
      startingAfter,
      endingBefore,
      controller.getAccountFiatWithdrawals(order),
      'id'
    ),
  };
}

/**
 * POST Endpoints
 */

const subAccountIdempotencyHandler = new IdempotencyHandler<
  CrossAccountWithdrawalRequest,
  Withdrawal
>();
const peerAccountIdempotencyHandler = new IdempotencyHandler<
  CrossAccountWithdrawalRequest,
  Withdrawal
>();
const blockchainIdempotencyHandler = new IdempotencyHandler<
  BlockchainWithdrawalRequest,
  Withdrawal
>();
const fiatIdempotencyHandler = new IdempotencyHandler<FiatWithdrawalRequest, Withdrawal>();

export async function createSubAccountWithdrawal(
  { body, params }: FastifyRequest<{ Body: CrossAccountWithdrawalRequest; Params: AccountParam }>,
  reply: FastifyReply
): Promise<Withdrawal> {
  const { accountId } = params;

  const controller = controllers.getController(accountId);
  if (!controller) {
    return ErrorFactory.notFound(reply);
  }

  if (subAccountIdempotencyHandler.isKnownKey(body.idempotencyKey)) {
    return subAccountIdempotencyHandler.reply(body, reply);
  }

  const withdrawal = controller.createAccountWithdrawal(body);
  subAccountIdempotencyHandler.add(body, 200, withdrawal);

  return withdrawal;
}

export async function createPeerAccountWithdrawal(
  { body, params }: FastifyRequest<{ Body: CrossAccountWithdrawalRequest; Params: AccountParam }>,
  reply: FastifyReply
): Promise<Withdrawal> {
  const { accountId } = params;

  const controller = controllers.getController(accountId);
  if (!controller) {
    return ErrorFactory.notFound(reply);
  }

  if (peerAccountIdempotencyHandler.isKnownKey(body.idempotencyKey)) {
    return peerAccountIdempotencyHandler.reply(body, reply);
  }

  const withdrawal = controller.createAccountWithdrawal(body);
  peerAccountIdempotencyHandler.add(body, 200, withdrawal);

  return withdrawal;
}

export async function createBlockchainWithdrawal(
  { body, params }: FastifyRequest<{ Body: BlockchainWithdrawalRequest; Params: AccountParam }>,
  reply: FastifyReply
): Promise<Withdrawal> {
  const { accountId } = params;

  const controller = controllers.getController(accountId);
  if (!controller) {
    return ErrorFactory.notFound(reply);
  }

  if (blockchainIdempotencyHandler.isKnownKey(body.idempotencyKey)) {
    return blockchainIdempotencyHandler.reply(body, reply);
  }

  const withdrawal = controller.createAccountWithdrawal(body);
  blockchainIdempotencyHandler.add(body, 200, withdrawal);

  return withdrawal;
}

export async function createFiatWithdrawal(
  { body, params }: FastifyRequest<{ Body: FiatWithdrawalRequest; Params: AccountParam }>,
  reply: FastifyReply
): Promise<Withdrawal> {
  const { accountId } = params;

  const controller = controllers.getController(accountId);
  if (!controller) {
    return ErrorFactory.notFound(reply);
  }

  if (fiatIdempotencyHandler.isKnownKey(body.idempotencyKey)) {
    return fiatIdempotencyHandler.reply(body, reply);
  }

  const withdrawal = controller.createAccountWithdrawal(body);
  fiatIdempotencyHandler.add(body, 200, withdrawal);

  return withdrawal;
}
