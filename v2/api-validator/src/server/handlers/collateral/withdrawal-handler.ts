import { FastifyRequest, FastifyReply } from 'fastify';
import * as ErrorFactory from '../../http-error-factory';
import { CollateralController } from '../../controllers/collateral/collateral-controller';
import {
  CollateralWithdrawalTransaction,
  CollateralWithdrawalTransactionRequest,
  CollateralWithdrawalTransactionIntentRequest,
  CollateralWithdrawalTransactionIntentResponse,
  CollateralWithdrawalTransactions,
} from '../../../client/generated';
import { ControllersContainer } from '../../controllers/controllers-container';
import { getPaginationResult } from '../../controllers/pagination-controller';
import {
  AccountIdPathParam,
  PaginationQuerystring,
  CollateralIdPathParam,
  CollateralTxIdPathParam,
} from '../request-types';

const controllers = new ControllersContainer(() => new CollateralController());

export async function initiateCollateralWithdrawalTransactionIntent(
  request: FastifyRequest<
    AccountIdPathParam &
      CollateralIdPathParam & { Body: CollateralWithdrawalTransactionIntentRequest }
  >,
  reply: FastifyReply
): Promise<CollateralWithdrawalTransactionIntentResponse> {
  {
    const { accountId } = request.params;
    const { approvalRequest, amount, destinationAddress } = request.body;
    const controller = controllers.getController(accountId);

    if (!controller) {
      return ErrorFactory.notFound(reply);
    }

    const newCollateralDepositTransaction =
      controller.initiateCollateralWithdrawalTransactionIntent(
        undefined,
        amount,
        destinationAddress,
        approvalRequest
      );

    return newCollateralDepositTransaction;
  }
}

export async function createCollateralWithdrawalTransaction(
  request: FastifyRequest<
    AccountIdPathParam & CollateralIdPathParam & { Body: CollateralWithdrawalTransactionRequest }
  >,
  reply: FastifyReply
): Promise<CollateralWithdrawalTransaction> {
  {
    const { accountId } = request.params;
    const { collateralTxId, approvalRequest } = request.body;
    const controller = controllers.getController(accountId);

    if (!controller) {
      return ErrorFactory.notFound(reply);
    }

    const newCollateralDepositTransaction = controller.createCollateralWithdrawalTransaction(
      collateralTxId,
      approvalRequest
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
