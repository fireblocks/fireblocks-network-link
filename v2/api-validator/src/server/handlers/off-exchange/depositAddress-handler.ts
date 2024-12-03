import { FastifyRequest, FastifyReply } from 'fastify';
import * as ErrorFactory from '../../http-error-factory';
import { CollateralController } from '../../controllers/off-exchange/collateral-controller';
import {
  CollateralDepositAddresses,
  CollateralAddress,
  CollateralDepositAddressesForAsset,
} from '../../../client/generated';
import { ControllersContainer } from '../../controllers/controllers-container';
import { getPaginationResult } from '../../controllers/pagination-controller';
import {
  AccountIdPathParam,
  PaginationQuerystring,
  CollateralIdPathParam,
  fireblocksAssetIdPathParam,
} from '../request-types';

const controllers = new ControllersContainer(() => new CollateralController());

export async function getCollateralDepositAddresses(
  request: FastifyRequest<PaginationQuerystring & AccountIdPathParam & CollateralIdPathParam>,
  reply: FastifyReply
): Promise<CollateralDepositAddresses> {
  const { limit, startingAfter, endingBefore } = request.query;
  const { accountId } = request.params;

  const controller = controllers.getController(accountId);

  if (!controller) {
    return ErrorFactory.notFound(reply);
  }

  const addressList = controller.getCollateralDepositAddresses();

  return {
    addresses: getPaginationResult(limit, startingAfter, endingBefore, addressList, 'id'),
  };
}

export async function createCollateralDepositAddressForAsset(
  request: FastifyRequest<
    AccountIdPathParam &
      CollateralIdPathParam &
      fireblocksAssetIdPathParam & { Body: CollateralAddress }
  >,
  reply: FastifyReply
): Promise<CollateralDepositAddresses> {
  const { address, recoveryAccountId } = request.body;
  const { accountId, collateralId } = request.params;

  const controller = controllers.getController(accountId);

  if (!controller) {
    return ErrorFactory.notFound(reply);
  }

  const newCollateralDepositAddress = controller.createCollateralDepositAddressForAsset(
    address,
    recoveryAccountId,
    accountId,
    collateralId
  );
  return { addresses: [newCollateralDepositAddress] };
}

export async function getCollateralDepositAddressesForAsset(
  request: FastifyRequest<
    PaginationQuerystring & AccountIdPathParam & CollateralIdPathParam & fireblocksAssetIdPathParam
  >,
  reply: FastifyReply
): Promise<CollateralDepositAddressesForAsset> {
  const { limit, startingAfter, endingBefore } = request.query;
  const { accountId, fireblocksAssetId } = request.params;

  const controller = controllers.getController(accountId);

  if (!controller) {
    return ErrorFactory.notFound(reply);
  }

  const addressList = controller.getCollateralDepositAddressesForAsset(fireblocksAssetId);

  return {
    addresses: getPaginationResult(limit, startingAfter, endingBefore, addressList, 'id'),
  };
}
