import { FastifyRequest, FastifyReply } from 'fastify';
import * as ErrorFactory from '../../../http-error-factory';
import { CollateralController } from '../../../controllers/off-exchange/collateral/collateral-controller';
import {
  SettlementRequest,
  SettlementState,
  SettlementInstructions,
} from '../../../../client/generated';
import { ControllersContainer } from '../../../controllers/controllers-container';
import {
  AccountIdPathParam,
  PaginationQuerystring,
  CollateralIdPathParam,
  SettlementVersionPathParam,
} from '../../request-types';

const controllers = new ControllersContainer(() => new CollateralController());

export async function initiateSettlement(
  request: FastifyRequest<AccountIdPathParam & CollateralIdPathParam & { Body: SettlementRequest }>,
  reply: FastifyReply
): Promise<SettlementInstructions> {
  {
    const { settlementVersion } = request.body;
    const { accountId, collateralId } = request.params;

    const controller = controllers.getController(accountId);

    if (!controller) {
      return ErrorFactory.notFound(reply);
    }

    const newSettlement = controller.initiateSettlement(settlementVersion, accountId, collateralId);
    return newSettlement;
  }
}

export async function getCurrentSettlementInstructions(
  request: FastifyRequest<AccountIdPathParam & CollateralIdPathParam>,
  reply: FastifyReply
): Promise<SettlementInstructions> {
  const { accountId } = request.params;

  const controller = controllers.getController(accountId);

  if (!controller) {
    return ErrorFactory.notFound(reply);
  }

  const settlement = controller.getCurrentSettlementInstructions(accountId);

  return settlement;
}

export async function getSettlementDetails(
  request: FastifyRequest<
    PaginationQuerystring & AccountIdPathParam & CollateralIdPathParam & SettlementVersionPathParam
  >,
  reply: FastifyReply
): Promise<SettlementState> {
  const { accountId } = request.params;

  const controller = controllers.getController(accountId);

  if (!controller) {
    return ErrorFactory.notFound(reply);
  }

  const transaction = controller.getSettlementDetails();

  return transaction;
}
