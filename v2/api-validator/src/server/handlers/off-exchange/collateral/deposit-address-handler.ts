import { FastifyRequest, FastifyReply } from 'fastify';
import * as ErrorFactory from '../../../http-error-factory';
import { CollateralController } from '../../../controllers/off-exchange/collateral/collateral-controller';
import { CollateralDepositAddresses, CollateralAddress } from '../../../../client/generated';
import { ControllersContainer } from '../../../controllers/controllers-container';
import { getPaginationResult } from '../../../controllers/pagination-controller';
import {
  AccountIdPathParam,
  PaginationQuerystring,
  CollateralIdPathParam,
  EntityIdPathParam,
  DepositAddressesQuerystring
} from '../../request-types';

const controllers = new ControllersContainer(() => new CollateralController());

export async function getCollateralDepositAddresses(
  request: FastifyRequest<PaginationQuerystring & DepositAddressesQuerystring & AccountIdPathParam & CollateralIdPathParam>,
  reply: FastifyReply
): Promise<CollateralDepositAddresses> {
  const { limit, startingAfter, endingBefore, cryptocurrencySymbol, blockchain } = request.query;
  const { accountId } = request.params;

  const controller = controllers.getController(accountId);

  if (!controller) {
    return ErrorFactory.notFound(reply);
  }

  const addressList = controller.getCollateralDepositAddresses(cryptocurrencySymbol, blockchain);

  return {
    addresses: getPaginationResult(limit, startingAfter, endingBefore, addressList, 'id'),
  };
}

export async function createCollateralDepositAddressForAsset(
  request: FastifyRequest<
    AccountIdPathParam &
      CollateralIdPathParam & { Body: CollateralAddress }
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
    collateralId
  );
  return { addresses: [newCollateralDepositAddress] };
}

export async function getCollateralDepositAddressesDetails(
  request: FastifyRequest<
    PaginationQuerystring & AccountIdPathParam & CollateralIdPathParam & EntityIdPathParam
  >,
  reply: FastifyReply
): Promise<CollateralDepositAddresses> {
  const { limit, startingAfter, endingBefore } = request.query;
  const { accountId, id } = request.params;

  const controller = controllers.getController(accountId);

  if (!controller) {
    return ErrorFactory.notFound(reply);
  }

  const addressList = controller.getCollateralDepositAddressesDetails(id);

  return {
    addresses: getPaginationResult(limit, startingAfter, endingBefore, addressList, 'id'),
  };
}
