import { FastifyRequest, FastifyReply } from 'fastify';
import * as ErrorFactory from '../../http-error-factory';
import { CollateralController } from '../../controllers/off-exchange/collateral-controller';
import {
  CollateralWithdrawalTransaction,
  CollateralWithdrawalTransactionRequest,
  CollateralWithdrawalTransactions,
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

export async function initiateCollateralWithdrawalTransaction(
  request: FastifyRequest<
    AccountIdPathParam &
      CollateralIdPathParam &
      FireblocksAssetIdPathParam & { Body: CollateralWithdrawalTransactionRequest }
  >,
  reply: FastifyReply
): Promise<CollateralWithdrawalTransaction> {
  {
    const { fireblocksAssetId, amount } = request.body;
    const { accountId } = request.params;

    const controller = controllers.getController(accountId);

    if (!controller) {
      return ErrorFactory.notFound(reply);
    }

    const newCollateralDepositTransaction = controller.initiateCollateralWithdrawalTransaction(
      amount,
      fireblocksAssetId,
      accountId
    );
    return newCollateralDepositTransaction;
  }
}

export async function getCollateralWithdrawalTransactions(
  request: FastifyRequest<PaginationQuerystring & AccountIdPathParam & CollateralIdPathParam>,
  reply: FastifyReply
): Promise<CollateralWithdrawalTransactions> {
  const { limit, startingAfter, endingBefore } = request.query;
  const { accountId } = request.params;

  const controller = controllers.getController(accountId);

  if (!controller) {
    return ErrorFactory.notFound(reply);
  }

  const transactionList = controller.getCollateralWithdrawalTransactions();

  return {
    transactions: getPaginationResult(limit, startingAfter, endingBefore, transactionList, 'id'),
  };
}

export async function getCollateralWithdrawalTransactionDetails(
  request: FastifyRequest<
    PaginationQuerystring & AccountIdPathParam & CollateralIdPathParam & CollateralTxIdPathParam
  >,
  reply: FastifyReply
): Promise<CollateralWithdrawalTransaction> {
  const { accountId, collateralTxId } = request.params;

  const controller = controllers.getController(accountId);

  if (!controller) {
    return ErrorFactory.notFound(reply);
  }

  const transaction = controller.getCollateralwithdrawalTransactionDetails(collateralTxId);

  return transaction;
}
