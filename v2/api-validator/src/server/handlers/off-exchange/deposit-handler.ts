import { FastifyRequest, FastifyReply } from 'fastify';
import * as ErrorFactory from '../../http-error-factory';
import { CollateralController } from '../../controllers/off-exchange/collateral-controller';
import {
  CollateralDepositTransaction,
  CollateralDepositTransactions,
} from '../../../client/generated';
import { ControllersContainer } from '../../controllers/controllers-container';
import { getPaginationResult } from '../../controllers/pagination-controller';
import {
  AccountIdPathParam,
  PaginationQuerystring,
  CollateralIdPathParam,
  FireblocksAssetIdPathParam,
  CollateralTxIdPathParam,
} from '../request-types';

const controllers = new ControllersContainer(() => new CollateralController());

export async function registerCollateralDepositTransaction(
  request: FastifyRequest<
    AccountIdPathParam &
      CollateralIdPathParam &
      FireblocksAssetIdPathParam & { Body: CollateralDepositTransaction }
  >,
  reply: FastifyReply
): Promise<CollateralDepositTransaction> {
  {
    const { collateralTxId, fireblocksAssetId, amount, status } = request.body;
    const { accountId, collateralId } = request.params;

    const controller = controllers.getController(accountId);

    if (!controller) {
      return ErrorFactory.notFound(reply);
    }

    const newCollateralDepositTransaction = controller.registerCollateralDepositTransaction(
      status,
      amount,
      collateralTxId,
      fireblocksAssetId,
      accountId,
      collateralId
    );
    return newCollateralDepositTransaction;
  }
}

export async function getCollateralDepositTransactions(
  request: FastifyRequest<PaginationQuerystring & AccountIdPathParam & CollateralIdPathParam>,
  reply: FastifyReply
): Promise<CollateralDepositTransactions> {
  const { limit, startingAfter, endingBefore } = request.query;
  const { accountId } = request.params;

  const controller = controllers.getController(accountId);

  if (!controller) {
    return ErrorFactory.notFound(reply);
  }

  const transactionList = controller.getCollateralDepositTransactions();

  return {
    transactions: getPaginationResult(limit, startingAfter, endingBefore, transactionList, 'id'),
  };
}

export async function getCollateralDepositTransactionDetails(
  request: FastifyRequest<
    PaginationQuerystring & AccountIdPathParam & CollateralIdPathParam & CollateralTxIdPathParam
  >,
  reply: FastifyReply
): Promise<CollateralDepositTransaction> {
  const { accountId, collateralTxId } = request.params;

  const controller = controllers.getController(accountId);

  if (!controller) {
    return ErrorFactory.notFound(reply);
  }

  const transaction = controller.getCollateralDepositTransactionDetails(collateralTxId);

  return transaction;
}
