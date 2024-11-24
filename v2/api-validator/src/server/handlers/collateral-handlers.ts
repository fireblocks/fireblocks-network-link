import { FastifyRequest, FastifyReply } from 'fastify';
import * as ErrorFactory from '../http-error-factory';
import {
  CollateralAccountNotExist,
  CollateralController,
} from '../controllers/collateral-controller';
import { CollateralAccount } from '../../client/generated';
import { ControllersContainer } from '../controllers/controllers-container';
import { getPaginationResult } from '../controllers/pagination-controller';
import { AccountIdPathParam, PaginationQuerystring } from './request-types';

const collateralController = new CollateralController();
const controllers = new ControllersContainer(() => new CollateralController());

type CreateCollateralAccountLinkRequest = {
  Body: CollateralAccount;
  Params: { accountId: string };
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
