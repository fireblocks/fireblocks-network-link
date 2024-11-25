import { FastifyRequest, FastifyReply } from 'fastify';
import * as ErrorFactory from '../http-error-factory';
import {
  CollateralAccountNotExist,
  CollateralController,
} from '../controllers/collateral-controller';
import { CollateralAccount, CollateralDepositAddresses } from '../../client/generated';
import { ControllersContainer } from '../controllers/controllers-container';
import { getPaginationResult } from '../controllers/pagination-controller';
import { AccountIdPathParam, PaginationQuerystring } from './request-types';

const collateralController = new CollateralController();
const controllers = new ControllersContainer(() => new CollateralController());

type CreateCollateralAccountLinkRequest = {
  Body: CollateralAccount;
  Params: { accountId: string };
};

type AccountIdandCollateralIdPAthParam = {
  Params: {
    accountId: string;
    collateralId: string;
  };
};

type CollateralLinkListResponse = { collateralLinks: CollateralAccount[] };
export type CollateralCapabilitiesResponse = { capabilities: CollateralAccount[] };

export async function getCollateralCapabilities(): Promise<CollateralCapabilitiesResponse> {
  return { capabilities: collateralController.getCollateralAccountLinks() };
}

export async function createCollateralAccountLink(
  request: FastifyRequest<CreateCollateralAccountLinkRequest>,
  reply: FastifyReply
): Promise<CollateralAccount> {
  try {
    const { accountId } = request.params;
    const collateralAccount = request.body;

    if (!accountId) {
      return ErrorFactory.notFound(reply);
    }

    if (!collateralAccount.collateralId || collateralAccount.collateralSigners.length <= 0) {
      return ErrorFactory.notFound(reply);
    }

    const newLink = collateralController.createCollateralAccountLink(accountId, collateralAccount);
    return newLink;
  } catch (err) {
    if (err instanceof CollateralAccountNotExist) {
      return ErrorFactory.notFound(reply);
    }
    throw err;
  }
}

export async function getCollateralAccountLinks(
  request: FastifyRequest<PaginationQuerystring & AccountIdPathParam>,
  reply: FastifyReply
): Promise<CollateralLinkListResponse> {
  const { limit, startingAfter, endingBefore } = request.query;
  const { accountId } = request.params;

  const controller = controllers.getController(accountId);

  if (!controller) {
    return ErrorFactory.notFound(reply);
  }

  if (limit === undefined || isNaN(limit)) {
    return ErrorFactory.notFound(reply);
  }

  return {
    collateralLinks: getPaginationResult(
      limit,
      startingAfter,
      endingBefore,
      controller.getCollateralAccountLinks(),
      'collateralId'
    ),
  };
}

export async function getCollateralDepositAddresses(
  request: FastifyRequest<PaginationQuerystring & AccountIdandCollateralIdPAthParam>,
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

  return {
    addresses: getPaginationResult(
      limit,
      startingAfter,
      endingBefore,
      controller.getCollateralDepositAddresses(),
      /* Currently creates infinite loop due to the fact that the pagination function require and 
      id as a unique value to seacrh the next page on and to stop when there is non, need to update the OpenApi, 
      suspecting thet the same issue can happen for getCollateralAccountLinks  */
      'recoveryAccountId'
    ),
  };
}
