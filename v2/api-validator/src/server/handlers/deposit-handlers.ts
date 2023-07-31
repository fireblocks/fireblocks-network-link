import { FastifyReply, FastifyRequest } from 'fastify';
import {
  BadRequestError,
  DepositAddress,
  DepositAddressCreationRequest,
  DepositCapability,
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

  try {
    validateDepositAddressCreationRequest(request.body);
  } catch (err) {
    if (err instanceof UnknownAdditionalAssetError) {
      return ErrorFactory.badRequest(reply, {
        message: err.message,
        errorType: BadRequestError.errorType.UNKNOWN_ASSET,
        requestPart: RequestPart.BODY,
        propertyName: '/destination/asset/assetId',
      });
    }
    throw err;
  }

  const depositAddress = depositAddressFromDepositAddressRequest(request.body);

  addNewDepositAddressForAccount(accountId, depositAddress);

  return depositAddress;
}
