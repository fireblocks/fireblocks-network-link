import { FastifyRequest, FastifyReply } from 'fastify';
import * as ErrorFactory from '../http-error-factory';
import {
  CollateralAccountNotExist,
  CollateralController,
} from '../controllers/collateral-controller';
import { CollateralAccount } from '../../client/generated';

const collateralController = new CollateralController();

type CreateCollateralAccountLinkRequest = {
  Body: CollateralAccount;
  Params: { accountId: string };
};

export type CollateralCapabilitiesResponse = { capabilities: CollateralAccount[] };

type GetCollateralAccountLinksRequest = {
  Params: { accountId: string };
};

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

// export async function getCollateralAccountLinks(
//   request: FastifyRequest<GetCollateralAccountLinksRequest>,
//   reply: FastifyReply
// ): Promise<void> {
//   try {
//     const links = collateralController.getCollateralAccountLinks();
//     reply.status(200).send({ collateralLinks: links });
//   } catch (err) {
//     if (err instanceof CollateralAccountNotExist) {
//       if (!!reply.status(404)) {
//         ErrorFactory.notFound(reply)
//       }
//       if (!!reply.status(400)) {
//         return ErrorFactory.badRequest(reply, {
//           message: err.message,
//           errorType: BadRequestError.errorType.SCHEMA_PROPERTY_ERROR,
//           requestPart: RequestPart.BODY,
//         });
//     }
//     }
//   }
// }
