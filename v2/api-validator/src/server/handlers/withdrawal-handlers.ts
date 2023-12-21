import * as ErrorFactory from '../http-error-factory';
import { FastifyReply, FastifyRequest } from 'fastify';
import { IdempotencyHandler, IdempotentRequest } from '../controllers/idempotency-handler';
import { getPaginationResult } from '../controllers/pagination-controller';
import { ControllersContainer } from '../controllers/controllers-container';
import {
  TransferNotSupportedError,
  TransferDestinationNotAllowed,
  WithdrawalController,
  WithdrawalNotFoundError,
  WithdrawalRequest,
} from '../controllers/withdrawal-controller';
import {
  AccountIdPathParam,
  EntityIdPathParam,
  ListOrderQuerystring,
  PaginationQuerystring,
} from './request-types';
import {
  BadRequestError,
  BlockchainWithdrawalRequest,
  FiatWithdrawalRequest,
  InternalWithdrawalRequest,
  PeerAccountWithdrawalRequest,
  RequestPart,
  Withdrawal,
  WithdrawalCapability,
} from '../../client/generated';
import logger from '../../logging';

type PeerAccountWithdrawalRequestBody = { Body: PeerAccountWithdrawalRequest };
type InternalWithdrawalRequestBody = { Body: InternalWithdrawalRequest };
type BlockchainWithdrawalRequestBody = { Body: BlockchainWithdrawalRequest };
type FiatWithdrawalRequestBody = { Body: FiatWithdrawalRequest };

const controllers = new ControllersContainer(() => new WithdrawalController());

const log = logger('server:WithdrawalHandler');

/**
 * GET Endpoints
 */

export async function getWithdrawalMethods(
  request: FastifyRequest<AccountIdPathParam & PaginationQuerystring>,
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
  request: FastifyRequest<AccountIdPathParam & PaginationQuerystring & ListOrderQuerystring>,
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
  request: FastifyRequest<AccountIdPathParam & EntityIdPathParam>,
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
  request: FastifyRequest<AccountIdPathParam & PaginationQuerystring & ListOrderQuerystring>,
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
  request: FastifyRequest<AccountIdPathParam & PaginationQuerystring & ListOrderQuerystring>,
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
  request: FastifyRequest<AccountIdPathParam & PaginationQuerystring & ListOrderQuerystring>,
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
  request: FastifyRequest<AccountIdPathParam & PaginationQuerystring & ListOrderQuerystring>,
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
  InternalWithdrawalRequest,
  Withdrawal | BadRequestError
>();
const peerAccountIdempotencyHandler = new IdempotencyHandler<
  PeerAccountWithdrawalRequest,
  Withdrawal | BadRequestError
>();
const blockchainIdempotencyHandler = new IdempotencyHandler<
  BlockchainWithdrawalRequest,
  Withdrawal | BadRequestError
>();
const fiatIdempotencyHandler = new IdempotencyHandler<
  FiatWithdrawalRequest,
  Withdrawal | BadRequestError
>();

async function createWithdrawal<R extends IdempotentRequest & WithdrawalRequest>(
  createWithdrawalFunc: (body: R, accountId: string) => Withdrawal,
  idempotencyHandlerAdder: (req: R, code: number, res: Withdrawal | BadRequestError) => void,
  body: R,
  accountId: string,
  reply: FastifyReply
): Promise<Withdrawal> {
  try {
    const withdrawal = createWithdrawalFunc(body, accountId);
    idempotencyHandlerAdder(body, 200, withdrawal);
    return withdrawal;
  } catch (err) {
    if (err instanceof TransferNotSupportedError) {
      const response = {
        message: err.message,
        errorType: BadRequestError.errorType.UNSUPPORTED_TRANSFER_METHOD,
      };
      idempotencyHandlerAdder(body, 400, response);
      return ErrorFactory.badRequest(reply, response);
    } else if (err instanceof TransferDestinationNotAllowed) {
      const response = {
        message: err.message,
        errorType: BadRequestError.errorType.TRANSFER_DESTINATION_NOT_ALLOWED,
      };
      idempotencyHandlerAdder(body, 400, response);
      return ErrorFactory.badRequest(reply, response);
    }
    throw err;
  }
}
export async function createSubAccountWithdrawal(
  { body, params }: FastifyRequest<InternalWithdrawalRequestBody & AccountIdPathParam>,
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

  return createWithdrawal(
    (req, accountId) => controller.createSubAccountWithdrawal(req, accountId),
    (req, code, response) => subAccountIdempotencyHandler.add(req, code, response),
    body,
    accountId,
    reply
  );
  // try {
  //   const withdrawal = controller.createWithdrawal(body);
  //   subAccountIdempotencyHandler.add(body, 200, withdrawal);
  //   return withdrawal;
  // } catch (err) {
  //   if (err instanceof TransferNotSupportedError) {
  //     const response = {
  //       message: err.message,
  //       errorType: BadRequestError.errorType.UNSUPPORTED_TRANSFER_METHOD,
  //     };
  //     subAccountIdempotencyHandler.add(body, 400, response);
  //     return ErrorFactory.badRequest(reply, response);
  //   }
  //   throw err;
  // }
}

export async function createPeerAccountWithdrawal(
  { body, params }: FastifyRequest<PeerAccountWithdrawalRequestBody & AccountIdPathParam>,
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

  return createWithdrawal(
    (req) => controller.createPeerAccountWithdrawal(req),
    (req, code, response) => peerAccountIdempotencyHandler.add(req, code, response),
    body,
    accountId,
    reply
  );
}

export async function createBlockchainWithdrawal(
  { body, params }: FastifyRequest<BlockchainWithdrawalRequestBody & AccountIdPathParam>,
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

  return createWithdrawal(
    (req) => controller.createBlockchainWithdrawal(req),
    (req, code, response) => blockchainIdempotencyHandler.add(req, code, response),
    body,
    accountId,
    reply
  );
}

export async function createFiatWithdrawal(
  { body, params }: FastifyRequest<FiatWithdrawalRequestBody & AccountIdPathParam>,
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

  return createWithdrawal(
    (req) => controller.createFiatWithdrawal(req),
    (req, code, response) => fiatIdempotencyHandler.add(req, code, response),
    body,
    accountId,
    reply
  );
}
