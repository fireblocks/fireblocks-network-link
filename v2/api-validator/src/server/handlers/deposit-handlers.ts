import * as ErrorFactory from '../http-error-factory';
import { FastifyReply, FastifyRequest } from 'fastify';
import { IdempotencyHandler } from '../controllers/idempotency-handler';
import { getPaginationResult } from '../controllers/pagination-controller';
import { ControllersContainer } from '../controllers/controllers-container';
import { AssetsController, UnknownAdditionalAssetError } from '../controllers/assets-controller';
import { AccountIdPathParam, EntityIdPathParam, PaginationQuerystring } from './request-types';
import {
  BadRequestError,
  Deposit,
  DepositAddress,
  DepositAddressCreationRequest,
  DepositCapability,
  RequestPart,
} from '../../client/generated';
import {
  DepositAddressDisabledError,
  DepositAddressNotFoundError,
  DepositController,
  DepositNotFoundError,
} from '../controllers/deposit-controller';

function validateDepositAddressCreationRequest(
  depositAddressRequest: DepositAddressCreationRequest
): void {
  if (!AssetsController.isKnownAsset(depositAddressRequest.transferMethod.asset)) {
    throw new UnknownAdditionalAssetError();
  }
}

type CreateDepositAddressBody = { Body: DepositAddressCreationRequest };
type DepositCapabilitiesResponse = { capabilities: DepositCapability[] };

const idempotencyHandler = new IdempotencyHandler<
  DepositAddressCreationRequest,
  DepositAddress | BadRequestError
>();

const controllers = new ControllersContainer(() => new DepositController());

export async function getDepositMethods(
  request: FastifyRequest<PaginationQuerystring & AccountIdPathParam>,
  reply: FastifyReply
): Promise<DepositCapabilitiesResponse> {
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
      controller.getDepositCapabilities(),
      'id'
    ),
  };
}

export async function createDepositAddress(
  { body, params }: FastifyRequest<CreateDepositAddressBody & AccountIdPathParam>,
  reply: FastifyReply
): Promise<DepositAddress> {
  const { accountId } = params;

  if (idempotencyHandler.isKnownKey(body.idempotencyKey)) {
    return idempotencyHandler.reply(body, reply);
  }

  const controller = controllers.getController(accountId);
  if (!controller) {
    return ErrorFactory.notFound(reply);
  }

  try {
    validateDepositAddressCreationRequest(body);
  } catch (err) {
    if (err instanceof UnknownAdditionalAssetError) {
      const response = {
        message: err.message,
        errorType: BadRequestError.errorType.UNKNOWN_ASSET,
        requestPart: RequestPart.BODY,
        propertyName: '/transferMethod/asset/assetId',
      };
      idempotencyHandler.add(body, 400, response);
      return ErrorFactory.badRequest(reply, response);
    }
    throw err;
  }

  const depositAddress = controller.depositAddressFromDepositAddressRequest(body);
  controller.addNewDepositAddress(depositAddress);

  idempotencyHandler.add(body, 200, depositAddress);
  return depositAddress;
}

export async function getDepositAddresses(
  request: FastifyRequest<PaginationQuerystring & AccountIdPathParam>,
  reply: FastifyReply
): Promise<{ addresses: DepositAddress[] }> {
  const { accountId } = request.params;
  const { limit, startingAfter, endingBefore } = request.query;

  const controller = controllers.getController(accountId);
  if (!controller) {
    return ErrorFactory.notFound(reply);
  }

  return {
    addresses: getPaginationResult(
      limit,
      startingAfter,
      endingBefore,
      controller.getDepositAddresses(),
      'id'
    ),
  };
}

export async function getDepositAddressDetails(
  request: FastifyRequest<AccountIdPathParam & EntityIdPathParam>,
  reply: FastifyReply
): Promise<DepositAddress> {
  const { accountId, id: depositAddressId } = request.params;

  const controller = controllers.getController(accountId);
  if (!controller) {
    return ErrorFactory.notFound(reply);
  }

  try {
    return controller.getDepositAddress(depositAddressId);
  } catch (err) {
    if (err instanceof DepositAddressNotFoundError) {
      return ErrorFactory.notFound(reply);
    }
    throw err;
  }
}

export async function disableDepositAddress(
  request: FastifyRequest<AccountIdPathParam & EntityIdPathParam>,
  reply: FastifyReply
): Promise<DepositAddress> {
  const { accountId, id: depositAddressId } = request.params;

  const controller = controllers.getController(accountId);
  if (!controller) {
    return ErrorFactory.notFound(reply);
  }

  try {
    return controller.disableDepositAddress(depositAddressId);
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
  request: FastifyRequest<PaginationQuerystring & AccountIdPathParam>,
  reply: FastifyReply
): Promise<{ deposits: Deposit[] }> {
  const { accountId } = request.params;
  const { limit, startingAfter, endingBefore } = request.query;

  const controller = controllers.getController(accountId);
  if (!controller) {
    return ErrorFactory.notFound(reply);
  }

  return {
    deposits: getPaginationResult(
      limit,
      startingAfter,
      endingBefore,
      controller.getAllDeposits(),
      'id'
    ),
  };
}

export async function getDepositDetails(
  request: FastifyRequest<AccountIdPathParam & EntityIdPathParam>,
  reply: FastifyReply
): Promise<Deposit> {
  const { accountId, id: depositId } = request.params;

  const controller = controllers.getController(accountId);
  if (!controller) {
    return ErrorFactory.notFound(reply);
  }

  try {
    return controller.getDeposit(depositId);
  } catch (err) {
    if (err instanceof DepositNotFoundError) {
      return ErrorFactory.notFound(reply);
    }
    throw err;
  }
}
