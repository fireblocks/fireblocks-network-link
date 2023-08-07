import * as ErrorFactory from '../http-error-factory';
import { FastifyReply, FastifyRequest } from 'fastify';
import { accountsController } from '../controllers/accounts-controller';
import { UnknownAdditionalAssetError } from '../controllers/assets-controller';
import { PaginationParams, getPaginationResult } from '../controllers/pagination-controller';
import {
  InvalidAssetQueryCombinationError,
  balanceController,
} from '../controllers/balances-controller';
import {
  AssetIdQueryParam,
  BadRequestError,
  Balances,
  CryptocurrencySymbolQueryParam,
  EntityIdPathParam,
  NationalCurrencyCodeQueryParam,
  RequestPart,
} from '../../client/generated';

export async function getBalances(
  request: FastifyRequest,
  reply: FastifyReply
): Promise<{ balances: Balances }> {
  const { accountId } = request.params as { accountId: EntityIdPathParam };
  const {
    limit,
    startingAfter,
    endingBefore,
    assetId,
    nationalCurrencyCode,
    cryptocurrencySymbol,
  } = request.query as PaginationParams & {
    assetId?: AssetIdQueryParam;
    nationalCurrencyCode?: NationalCurrencyCodeQueryParam;
    cryptocurrencySymbol?: CryptocurrencySymbolQueryParam;
  };

  if (!accountsController.isKnownSubAccount(accountId)) {
    return ErrorFactory.notFound(reply);
  }

  try {
    balanceController.validateAssetQueryParams(assetId, nationalCurrencyCode, cryptocurrencySymbol);

    if (assetId) {
      return { balances: balanceController.getSingleAssetBalance(accountId, { assetId }) };
    }
    if (nationalCurrencyCode) {
      return {
        balances: balanceController.getSingleAssetBalance(accountId, { nationalCurrencyCode }),
      };
    }
    if (cryptocurrencySymbol) {
      return {
        balances: balanceController.getSingleAssetBalance(accountId, { cryptocurrencySymbol }),
      };
    }
  } catch (err) {
    if (err instanceof InvalidAssetQueryCombinationError) {
      ErrorFactory.badRequest(reply, {
        message: err.message,
        errorType: BadRequestError.errorType.SCHEMA_ERROR,
        requestPart: RequestPart.QUERYSTRING,
      });
    }
    if (err instanceof UnknownAdditionalAssetError) {
      ErrorFactory.badRequest(reply, {
        message: err.message,
        errorType: BadRequestError.errorType.UNKNOWN_ASSET,
        requestPart: RequestPart.QUERYSTRING,
      });
    }
    throw err;
  }

  return {
    balances: getPaginationResult(
      limit,
      startingAfter,
      endingBefore,
      balanceController.getSubAccountBalances(accountId),
      'id'
    ),
  };
}

export async function getHistoricBalances(
  request: FastifyRequest,
  reply: FastifyReply
): Promise<{ balances: Balances }> {
  return getBalances(request, reply);
}
