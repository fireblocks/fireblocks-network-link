import { FastifyRequest, FastifyReply } from 'fastify';
import * as ErrorFactory from '../../http-error-factory';
import { CollateralController } from '../../controllers/collateral/collateral-controller';
import {
  CollateralDepositAddresses,
  CollateralAddress,
  AssetIdQueryParam,
  CryptocurrencySymbolQueryParam,
  CollateralAssetAddress,
} from '../../../client/generated';
import { ControllersContainer } from '../../controllers/controllers-container';
import { getPaginationResult } from '../../controllers/pagination-controller';
import {
  AccountIdPathParam,
  PaginationQuerystring,
  CollateralIdPathParam,
  EntityIdPathParam,
} from '../request-types';

type AssetQuery = {
  assetId?: AssetIdQueryParam;
  cryptocurrencySymbol?: CryptocurrencySymbolQueryParam;
};

type AssetQuerystring = { Querystring: AssetQuery };

const controllers = new ControllersContainer(() => new CollateralController());

export async function getCollateralDepositAddresses(
  request: FastifyRequest<
    PaginationQuerystring & AssetQuerystring & AccountIdPathParam & CollateralIdPathParam
  >,
  reply: FastifyReply
): Promise<CollateralDepositAddresses> {
  const { limit, startingAfter, endingBefore, cryptocurrencySymbol, assetId } = request.query;
  const { accountId } = request.params;

  const controller = controllers.getController(accountId);

  if (!controller) {
    return ErrorFactory.notFound(reply);
  }

  const addressList = controller.getCollateralDepositAddresses(cryptocurrencySymbol, assetId);

  return {
    addresses: getPaginationResult(limit, startingAfter, endingBefore, addressList, 'id'),
  };
}

export async function createCollateralDepositAddressForAsset(
  request: FastifyRequest<AccountIdPathParam & CollateralIdPathParam & { Body: CollateralAddress }>,
  reply: FastifyReply
): Promise<CollateralAssetAddress> {
  const { address, recoveryAccountId } = request.body;
  const { accountId } = request.params;

  const controller = controllers.getController(accountId);

  if (!controller) {
    return ErrorFactory.notFound(reply);
  }

  const newCollateralDepositAddress = controller.createCollateralDepositAddressForAsset(
    address,
    recoveryAccountId
  );
  return newCollateralDepositAddress;
}

export async function getCollateralDepositAddressesDetails(
  request: FastifyRequest<AccountIdPathParam & CollateralIdPathParam & EntityIdPathParam>,
  reply: FastifyReply
): Promise<CollateralAssetAddress> {
  const { accountId, id } = request.params;

  const controller = controllers.getController(accountId);

  if (!controller) {
    return ErrorFactory.notFound(reply);
  }

  const address = controller.getCollateralDepositAddressesDetails(id);

  return address;
}
