import * as ErrorFactory from '../http-error-factory';
import { FastifyReply, FastifyRequest } from 'fastify';
import { accountsController } from '../controllers/accounts-controller';
import { UnknownAdditionalAssetError } from '../controllers/assets-controller';
import { getPaginationResult, PaginationParams } from '../controllers/pagination-controller';
import {
  BadRequestError,
  Deposit,
  DepositAddress,
  DepositAddressCreationRequest,
  DepositCapability,
  EntityIdPathParam,
  RequestPart,
  SubAccountIdPathParam,
} from '../../client/generated';
import {
  DEPOSIT_METHODS,
  DepositAddressDisabledError,
  DepositAddressNotFoundError,
  DepositNotFoundError,
  depositController,
} from '../controllers/deposit-controller';
import { IdempotencyHandler } from '../controllers/idempotency-handler';

const idempotencyHandler = new IdempotencyHandler<
  DepositAddressCreationRequest,
  DepositAddress | BadRequestError
>();

type AccountParam = { accountId: SubAccountIdPathParam };

export async function getDepositMethods(
  request: FastifyRequest<{ Querystring: PaginationParams; Params: AccountParam }>,
  reply: FastifyReply
): Promise<{ capabilities: DepositCapability[] }> {
  const { limit, startingAfter, endingBefore } = request.query;
  const { accountId } = request.params;

  if (!accountsController.isKnownSubAccount(accountId)) {
    return ErrorFactory.notFound(reply);
  }

  return {
    capabilities: getPaginationResult(limit, startingAfter, endingBefore, DEPOSIT_METHODS, 'id'),
  };
}

export async function createDepositAddress(
  { body, params }: FastifyRequest<{ Params: AccountParam; Body: DepositAddressCreationRequest }>,
  reply: FastifyReply
): Promise<DepositAddress> {
  const { accountId } = params;

  if (idempotencyHandler.isKnownKey(body.idempotencyKey)) {
    return idempotencyHandler.reply(body, reply);
  }

  if (!accountsController.isKnownSubAccount(accountId)) {
    return ErrorFactory.notFound(reply);
  }

  try {
    depositController.validateDepositAddressCreationRequest(body);
  } catch (err) {
    if (err instanceof UnknownAdditionalAssetError) {
      const response = {
        message: err.message,
        errorType: BadRequestError.errorType.UNKNOWN_ASSET,
        requestPart: RequestPart.BODY,
        propertyName: '/destination/asset/assetId',
      };
      idempotencyHandler.add(body, 400, response);
      ErrorFactory.badRequest(reply, response);
    }
    throw err;
  }

  const depositAddress = depositController.depositAddressFromDepositAddressRequest(body);
  depositController.addNewDepositAddressForAccount(accountId, depositAddress);

  idempotencyHandler.add(body, 200, depositAddress);
  return depositAddress;
}

export async function getDepositAddresses(
  request: FastifyRequest<{ Querystring: PaginationParams; Params: AccountParam }>,
  reply: FastifyReply
): Promise<{ addresses: DepositAddress[] }> {
  const { accountId } = request.params;
  const { limit, startingAfter, endingBefore } = request.query;

  if (!accountsController.isKnownSubAccount(accountId)) {
    return ErrorFactory.notFound(reply);
  }

  const accountDepositAddresses = depositController.getAccountDepositAddresses(accountId);

  return {
    addresses: getPaginationResult(
      limit,
      startingAfter,
      endingBefore,
      accountDepositAddresses,
      'id'
    ),
  };
}

export async function getDepositAddressDetails(
  request: FastifyRequest<{ Params: AccountParam & { id: EntityIdPathParam } }>,
  reply: FastifyReply
): Promise<DepositAddress> {
  const { accountId, id: depositAddressId } = request.params;

  if (!accountsController.isKnownSubAccount(accountId)) {
    return ErrorFactory.notFound(reply);
  }

  const accountDepositAddresses = depositController.getAccountDepositAddresses(accountId);
  const depositAddress = accountDepositAddresses.find(
    (depositAddress) => depositAddress.id === depositAddressId
  );

  if (!depositAddress) {
    return ErrorFactory.notFound(reply);
  }

  return depositAddress;
}

export async function disableDepositAddress(
  request: FastifyRequest<{ Params: AccountParam & { id: EntityIdPathParam } }>,
  reply: FastifyReply
): Promise<DepositAddress> {
  const { accountId, id: depositAddressId } = request.params;

  if (!accountsController.isKnownSubAccount(accountId)) {
    return ErrorFactory.notFound(reply);
  }

  try {
    return depositController.disableAccountDepositAddress(accountId, depositAddressId);
  } catch (err) {
    if (err instanceof DepositAddressNotFoundError) {
      return ErrorFactory.notFound(reply);
    }
    if (err instanceof DepositAddressDisabledError) {
      return ErrorFactory.badRequest(reply, {
        message: err.message,
        errorType: BadRequestError.errorType.DEPOSIT_ADDRESS_DISABLED,
      });
    }
    throw err;
  }
}

export async function getDeposits(
  request: FastifyRequest<{ Querystring: PaginationParams; Params: AccountParam }>,
  reply: FastifyReply
): Promise<{ deposits: Deposit[] }> {
  const { accountId } = request.params;
  const { limit, startingAfter, endingBefore } = request.query;

  if (!accountsController.isKnownSubAccount(accountId)) {
    return ErrorFactory.notFound(reply);
  }

  return {
    deposits: getPaginationResult(
      limit,
      startingAfter,
      endingBefore,
      depositController.getAllDeposits(accountId),
      'id'
    ),
  };
}

export async function getDepositDetails(
  request: FastifyRequest<{ Params: AccountParam & { id: EntityIdPathParam } }>,
  reply: FastifyReply
): Promise<Deposit> {
  const { accountId, id: depositId } = request.params;

  if (!accountsController.isKnownSubAccount(accountId)) {
    return ErrorFactory.notFound(reply);
  }

  try {
    return depositController.getDeposit(accountId, depositId);
  } catch (err) {
    if (err instanceof DepositNotFoundError) {
      return ErrorFactory.notFound(reply);
    }
    throw err;
  }
}
