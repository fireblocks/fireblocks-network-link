import { FastifyRequest, FastifyReply } from 'fastify';
import * as ErrorFactory from '../http-error-factory';
import {
  CollateralAccountNotExist,
  CollateralController,
} from '../controllers/collateral-controller';
import {
  CollateralAccount,
  BadRequestError,
  RequestPart,
  CollateralAccountLink,
  CollateralLinkStatus,
} from '../../client/generated';

const collateralController = new CollateralController();

type CreateCollateralAccountLinkRequest = {
  Body: CollateralAccount & { status: CollateralLinkStatus };
  Params: { accountId: string };
};

export type CollateralCapabilitiesResponse = { capabilities: CollateralAccountLink[] };

type GetCollateralAccountLinksRequest = {
  Params: { accountId: string };
};

export async function getCollateralCapabilities(): Promise<CollateralCapabilitiesResponse> {
  return { capabilities: collateralController.getCollateralAccountLinks() };
}

export async function createCollateralAccountLink(
  request: FastifyRequest<CreateCollateralAccountLinkRequest>,
  reply: FastifyReply
): Promise<void> {
  try {
    const { accountId } = request.params;
    const collateralAccount = request.body;
    const status = request.body.status;

    if (!accountId || !collateralAccount) {
      ErrorFactory.notFound(reply);
      return;
    }

    const newLink = collateralController.createCollateralAccountLink(
      status,
      accountId,
      collateralAccount
    );
    reply.status(200).send(newLink);
  } catch (err) {
    if (err instanceof CollateralAccountNotExist) {
      return ErrorFactory.badRequest(reply, {
        message: err.message,
        errorType: BadRequestError.errorType.SCHEMA_PROPERTY_ERROR,
        requestPart: RequestPart.BODY,
      });
    }
  }
}

export async function getCollateralAccountLinks(
  request: FastifyRequest<GetCollateralAccountLinksRequest>,
  reply: FastifyReply
): Promise<void> {
  try {
    const links = collateralController.getCollateralAccountLinks();
    reply.status(200).send({ collateralLinks: links });
  } catch (err) {
    if (err instanceof CollateralAccountNotExist) {
      return ErrorFactory.badRequest(reply, {
        message: err.message,
        errorType: BadRequestError.errorType.SCHEMA_PROPERTY_ERROR,
        requestPart: RequestPart.BODY,
      });
    }
  }
}
