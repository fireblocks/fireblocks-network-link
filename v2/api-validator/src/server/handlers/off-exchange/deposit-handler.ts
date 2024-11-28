import { FastifyRequest, FastifyReply } from 'fastify';
import * as ErrorFactory from '../../http-error-factory';
import {
  CollateralAccountNotExist,
  CollateralController,
} from '../../controllers/off-exchange/collateral-controller';
import { CollateralDepositAddresses, CollateralAddress } from '../../../client/generated';
import { ControllersContainer } from '../../controllers/controllers-container';
import { getPaginationResult } from '../../controllers/pagination-controller';
import { AccountIdPathParam, PaginationQuerystring, CollateralIdPathParam, fireblocksAssetIdPathParam } from '../request-types';


const controllers = new ControllersContainer(() => new CollateralController());

export async function getCollateralDepositAddresses(
  request: FastifyRequest<PaginationQuerystring & AccountIdPathParam & CollateralIdPathParam>,
  reply: FastifyReply
): Promise<CollateralDepositAddresses> {
  const { limit, startingAfter, endingBefore } = request.query;
  const { accountId, collateralId } = request.params;

  const controller = controllers.getController(accountId);

  if (!controller) {
    return ErrorFactory.notFound(reply);
  }

  if (!collateralId) {
    return ErrorFactory.notFound(reply);
  }

  if (limit === undefined || isNaN(limit)) {
    return ErrorFactory.notFound(reply);
  }

  const addressList = controller.getCollateralDepositAddresses();

  return {
    addresses: getPaginationResult(
      limit,
      startingAfter,
      endingBefore,
      addressList,
      'id'
    ),
  };
}


export async function createCollateralDepositAddressForAsset(
  request: FastifyRequest<AccountIdPathParam & CollateralIdPathParam & fireblocksAssetIdPathParam & {Body: CollateralAddress} >,
  reply: FastifyReply
): Promise<CollateralDepositAddresses> {
  try {
    const { address, recoveryAccountId } = request.body;
    const { accountId, collateralId, fireblocksAssetId } = request.params;

    const controller = controllers.getController(accountId);

    if (!controller) {
      return ErrorFactory.notFound(reply);
    }

    if (!collateralId) {
      return ErrorFactory.notFound(reply);
    }

    if (!fireblocksAssetId) {
      return ErrorFactory.notFound(reply);
    }

    if (!address) {
      return ErrorFactory.notFound(reply);
    }

    if (!recoveryAccountId) {
      return ErrorFactory.notFound(reply);
    }

    const newCollateralDepositAddress = controller.createCollateralDepositAddressForAsset(
      address,
      recoveryAccountId,
      accountId,
      collateralId,
      fireblocksAssetId
    );
    return {addresses: [newCollateralDepositAddress]};
    } catch (err) {
      if (err instanceof CollateralAccountNotExist) {
        return ErrorFactory.notFound(reply);
      }
      throw err;
    }
}
