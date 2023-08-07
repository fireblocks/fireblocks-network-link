import * as ErrorFactory from '../http-error-factory';
import { FastifyReply, FastifyRequest } from 'fastify';
import { IdempotencyHandler } from '../controllers/idempotency-handler';
import { PaginationParams, getPaginationResult } from '../controllers/pagination-controller';
import {
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
import { assetsController } from '../controllers/assets-controller';

type AccountParam = { accountId: SubAccountIdPathParam };

const controllers = new ControllersContainer(
  () => new WithdrawalController(assetsController, 5, 5)
);

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
    capabilities: getPaginationResult(
      limit,
      startingAfter,
      endingBefore,
      controller.getCapabilites(),
      'id'
    ),
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
      controller.getWithdrawals(order),
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
    return controller.getWithdrawal(withdrawalId);
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
      controller.getSubAccountWithdrawals(order),
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
      controller.getPeerAccountWithdrawals(order),
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
      controller.getBlockchainWithdrawals(order),
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
      controller.getFiatWithdrawals(order),
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

  const withdrawal = controller.createWithdrawal(body);
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

  const withdrawal = controller.createWithdrawal(body);
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

  const withdrawal = controller.createWithdrawal(body);
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

  const withdrawal = controller.createWithdrawal(body);
  fiatIdempotencyHandler.add(body, 200, withdrawal);

  return withdrawal;
}
