import { FastifyReply, FastifyRequest } from 'fastify';
import {
  BadRequestError,
  DepositAddress,
  DepositAddressCreationRequest,
  DepositCapability,
  EntityIdPathParam,
  GeneralError,
  RequestPart,
  SubAccountIdPathParam,
} from '../../client/generated';
import { PaginationParams, getPaginationResult } from '../controllers/pagination-controller';
import { DEPOSIT_METHODS } from '../controllers/deposit-controller';
import { isKnownSubAccount } from '../controllers/accounts-controller';
import * as ErrorFactory from '../http-error-factory';
import { depositAddressFromDepositAddressRequest } from '../controllers/deposit-controller';
import { addNewDepositAddressForAccount } from '../controllers/deposit-controller';
import { UnknownAdditionalAssetError } from '../controllers/assets-controller';
import { validateDepositAddressCreationRequest } from '../controllers/deposit-controller';
import { isUsedIdempotencyKey } from '../controllers/deposit-controller';
import { getIdempotencyResponseForKey } from '../controllers/deposit-controller';
import { registerCreateDepositAddressIdempotencyResponse } from '../controllers/deposit-controller';
import _ from 'lodash';
import { getAccountDepositAddresses } from '../controllers/deposit-controller';
import { disableAccountDepositAddress } from '../controllers/deposit-controller';
import { DepositAddressNotFoundError } from '../controllers/deposit-controller';
import { DepositAddressDisabledError } from '../controllers/deposit-controller';

type AccountParam = { accountId: SubAccountIdPathParam };

export async function getDepositMethods(
  request: FastifyRequest<{ Querystring: PaginationParams; Params: AccountParam }>,
  reply: FastifyReply
): Promise<{ capabilities: DepositCapability[] }> {
  const { limit, startingAfter, endingBefore } = request.query;
  const { accountId } = request.params;

  if (!isKnownSubAccount(accountId)) {
    return ErrorFactory.notFound(reply);
  }

  return {
    capabilities: getPaginationResult(limit, startingAfter, endingBefore, DEPOSIT_METHODS, 'id'),
  };
}

export async function createDepositAddress(
  request: FastifyRequest<{ Params: AccountParam; Body: DepositAddressCreationRequest }>,
  reply: FastifyReply
): Promise<DepositAddress> {
  const { accountId } = request.params;

  if (!isKnownSubAccount(accountId)) {
    return ErrorFactory.notFound(reply);
  }

  if (isUsedIdempotencyKey(request.body.idempotencyKey)) {
    const idempotencyResponse = getIdempotencyResponseForKey(request.body.idempotencyKey);
    if (!_.isEqual(request.body, idempotencyResponse.requestBody)) {
      return ErrorFactory.badRequest(reply, {
        message: 'Idempotency key was used in a previous request',
        errorType: BadRequestError.errorType.USED_IDEMPOTENCY_KEY,
      });
    }
    return reply.code(idempotencyResponse.status).send(idempotencyResponse.responseBody);
  }

  try {
    validateDepositAddressCreationRequest(request.body);
  } catch (err) {
    if (err instanceof UnknownAdditionalAssetError) {
      const response = {
        message: err.message,
        errorType: BadRequestError.errorType.UNKNOWN_ASSET,
        requestPart: RequestPart.BODY,
        propertyName: '/destination/asset/assetId',
      };
      registerCreateDepositAddressIdempotencyResponse(request.body.idempotencyKey, {
        status: 400,
        requestBody: request.body,
        responseBody: response,
      });
      return ErrorFactory.badRequest(reply, response);
    }
    const response = {
      errorType: GeneralError.errorType.INTERNAL_ERROR,
    };
    registerCreateDepositAddressIdempotencyResponse(request.body.idempotencyKey, {
      status: 500,
      requestBody: request.body,
      responseBody: response,
    });
    return reply.code(500).send(response);
  }

  const depositAddress = depositAddressFromDepositAddressRequest(request.body);

  addNewDepositAddressForAccount(accountId, depositAddress);
  registerCreateDepositAddressIdempotencyResponse(request.body.idempotencyKey, {
    status: 200,
    requestBody: request.body,
    responseBody: depositAddress,
  });

  return depositAddress;
}

export async function getDepositAddresses(
  request: FastifyRequest<{ Querystring: PaginationParams; Params: AccountParam }>,
  reply: FastifyReply
): Promise<{ addresses: DepositAddress[] }> {
  const { accountId } = request.params;
  const { limit, startingAfter, endingBefore } = request.query;

  if (!isKnownSubAccount(accountId)) {
    return ErrorFactory.notFound(reply);
  }

  const accountDepositAddresses = getAccountDepositAddresses(accountId);

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

  if (!isKnownSubAccount(accountId)) {
    return ErrorFactory.notFound(reply);
  }

  const accountDepositAddresses = getAccountDepositAddresses(accountId);
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

  if (!isKnownSubAccount(accountId)) {
    return ErrorFactory.notFound(reply);
  }

  try {
    return disableAccountDepositAddress(accountId, depositAddressId);
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
