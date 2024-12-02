import { FastifyRequest, FastifyReply } from 'fastify';
import * as ErrorFactory from '../../http-error-factory';
import {
  NotFound,
  NotValid,
  CollateralController,
} from '../../controllers/off-exchange/collateral-controller';
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
  fireblocksAssetIdPathParam,
  CollateralTxIdPathParam,
} from '../request-types';

const controllers = new ControllersContainer(() => new CollateralController());

export async function initiateCollateralWithdrawalTransaction(
  request: FastifyRequest<
    AccountIdPathParam &
      CollateralIdPathParam &
      fireblocksAssetIdPathParam & { Body: CollateralWithdrawalTransactionRequest }
  >,
  reply: FastifyReply
): Promise<CollateralWithdrawalTransaction> {
  {
    try {
      const { fireblocksAssetId, amount, destinationAddress } = request.body;
      const { accountId, collateralId } = request.params;

      const controller = controllers.getController(accountId);

      if (!controller) {
        return ErrorFactory.notFound(reply);
      }

      if (!collateralId) {
        return ErrorFactory.notFound(reply);
      }

      if (!fireblocksAssetId) {
        return ErrorFactory.notFound(reply);
      }

      if (!destinationAddress) {
        return ErrorFactory.notFound(reply);
      }

      const newCollateralDepositTransaction = controller.initiateCollateralWithdrawalTransaction(
        amount,
        fireblocksAssetId,
        destinationAddress,
        accountId,
        collateralId
      );
      return newCollateralDepositTransaction;
    } catch (err) {
      if (err instanceof NotFound) {
        return ErrorFactory.notFound(reply);
      }
      throw err;
    }
  }
}

export async function getCollateralWithdrawalTransactions(
  request: FastifyRequest<PaginationQuerystring & AccountIdPathParam & CollateralIdPathParam>,
  reply: FastifyReply
): Promise<CollateralWithdrawalTransactions> {
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
  const { accountId, collateralId, collateralTxId } = request.params;

  const controller = controllers.getController(accountId);

  if (!controller) {
    return ErrorFactory.notFound(reply);
  }

  if (!collateralId) {
    return ErrorFactory.notFound(reply);
  }

  if (collateralTxId === undefined) {
    return ErrorFactory.notFound(reply);
  }

  const transaction = controller.getCollateralwithdrawalTransactionDetails(collateralTxId);

  return transaction;
}
