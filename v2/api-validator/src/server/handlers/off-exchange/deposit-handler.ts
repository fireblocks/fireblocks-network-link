import { FastifyRequest, FastifyReply } from 'fastify';
import * as ErrorFactory from '../../http-error-factory';
import {
  CollateralAccountNotExist,
  CollateralController,
} from '../../controllers/off-exchange/collateral-controller';
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
  fireblocksAssetIdPathParam,
  CollateralTxIdPathParam,
} from '../request-types';

const controllers = new ControllersContainer(() => new CollateralController());

export async function registerCollateralDepositTransaction(
  request: FastifyRequest<
    AccountIdPathParam &
      CollateralIdPathParam &
      fireblocksAssetIdPathParam & { Body: CollateralDepositTransaction }
  >,
  reply: FastifyReply
): Promise<CollateralDepositTransaction> {
  {
    try {
      const { collateralTxId, fireblocksAssetId, amount, status } = request.body;
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

      if (!collateralTxId) {
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
    } catch (err) {
      if (err instanceof CollateralAccountNotExist) {
        return ErrorFactory.notFound(reply);
      }
      throw err;
    }
  }
}

export async function getCollateralDepositTransactions(
  request: FastifyRequest<PaginationQuerystring & AccountIdPathParam & CollateralIdPathParam>,
  reply: FastifyReply
): Promise<CollateralDepositTransactions> {
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

  const transaction = controller.getCollateralDepositTransactionDetails(collateralTxId);

  return transaction;
}
