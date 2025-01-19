import { FastifyRequest, FastifyReply } from 'fastify';
import * as ErrorFactory from '../../http-error-factory';
import { CollateralController } from '../../controllers/collateral/collateral-controller';
import {
  CollateralWithdrawalTransaction,
  CollateralWithdrawalTransactionRequest,
  CollateralWithdrawalTransactions,
  CollateralWithdrawalTransactionExecutionRequest,
  CollateralWithdrawalTransactionExecutionResponse,
} from '../../../client/generated';
import { ControllersContainer } from '../../controllers/controllers-container';
import { getPaginationResult } from '../../controllers/pagination-controller';
import {
  AccountIdPathParam,
  PaginationQuerystring,
  CollateralIdPathParam,
  EntityIdPathParam,
} from '../request-types';

const controllers = new ControllersContainer(() => new CollateralController());

export async function initiateCollateralWithdrawalTransaction(
  request: FastifyRequest<
    AccountIdPathParam & CollateralIdPathParam & { Body: CollateralWithdrawalTransactionRequest }
  >,
  reply: FastifyReply
): Promise<CollateralWithdrawalTransaction> {
  {
    const { accountId } = request.params;
    const { destinationAddress } = request.body;
    const controller = controllers.getController(accountId);
    const tag = destinationAddress.addressTag != undefined ? destinationAddress.addressTag : '';

    if (!controller) {
      return ErrorFactory.notFound(reply);
    }

    const newCollateralDepositTransaction = controller.initiateCollateralWithdrawalTransaction(tag);

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

export async function executeCollateralWithdrawalTransaction(
  request: FastifyRequest<
    AccountIdPathParam &
      CollateralIdPathParam & { Body: CollateralWithdrawalTransactionExecutionRequest }
  >,
  reply: FastifyReply
): Promise<CollateralWithdrawalTransactionExecutionResponse> {
  {
    const { accountId } = request.params;
    const { collateralTxId } = request.body;
    const controller = controllers.getController(accountId);

    if (!controller) {
      return ErrorFactory.notFound(reply);
    }

    const newCollateralDepositTransaction =
      controller.executeCollateralWithdrawalTransaction(collateralTxId);
    return newCollateralDepositTransaction;
  }
}

export async function getCollateralWithdrawalTransactionDetails(
  request: FastifyRequest<
    PaginationQuerystring & AccountIdPathParam & CollateralIdPathParam & EntityIdPathParam
  >,
  reply: FastifyReply
): Promise<CollateralWithdrawalTransaction> {
  const { accountId, id } = request.params;

  const controller = controllers.getController(accountId);

  if (!controller) {
    return ErrorFactory.notFound(reply);
  }

  const transaction = controller.getCollateralwithdrawalTransactionDetails(id);

  return transaction;
}
