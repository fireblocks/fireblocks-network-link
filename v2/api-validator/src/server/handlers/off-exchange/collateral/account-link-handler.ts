import { FastifyRequest, FastifyReply } from 'fastify';
import * as ErrorFactory from '../../../http-error-factory';
import { CollateralController } from '../../../controllers/off-exchange/collateral/collateral-controller';
import { CollateralAccount, CollateralAccountLink } from '../../../../client/generated';
import { ControllersContainer } from '../../../controllers/controllers-container';
import { getPaginationResult } from '../../../controllers/pagination-controller';
import { AccountIdPathParam, PaginationQuerystring } from '../../request-types';

const controllers = new ControllersContainer(() => new CollateralController());

type CollateralLinkListResponse = { collateralLinks: CollateralAccountLink[] };

export async function createCollateralAccountLink(
  request: FastifyRequest<{ Body: CollateralAccount } & AccountIdPathParam>,
  reply: FastifyReply
): Promise<CollateralAccount> {
  const { accountId } = request.params;
  const collateralAccount = request.body;

  const controller = controllers.getController(accountId);

  if (!controller) {
    return ErrorFactory.notFound(reply);
  }
  const newLink = controller.createCollateralAccountLink(collateralAccount);
  return newLink;
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

  return {
    collateralLinks: getPaginationResult(
      limit,
      startingAfter,
      endingBefore,
      controller.getCollateralAccountLinks(),
      'id'
    ),
  };
}
