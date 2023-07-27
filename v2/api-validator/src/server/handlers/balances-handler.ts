import * as ErrorFactory from '../http-error-factory';
import { FastifyReply, FastifyRequest } from 'fastify';
import { isKnownSubAccount } from '../controllers/accounts-controller';
import {
  AssetIdQueryParam,
  BadRequestError,
  BalanceCapability,
  Balances,
  CryptocurrencySymbolQueryParam,
  EntityIdPathParam,
  NationalCurrencyCodeQueryParam,
} from '../../client/generated';
import { PaginationParams, getPaginationResult } from '../controllers/pagination-controller';
import {
  BALANCE_CAPABILITIES,
  InvalidAssetQueryCombinationError,
  getSubAccountBalances,
  validateAssetQueryParams,
} from '../controllers/balances-controller';

export async function getBalanceAssets(
  request: FastifyRequest,
  reply: FastifyReply
): Promise<{ capabilities: BalanceCapability[] }> {
  const { limit, startingAfter, endingBefore } = request.query as PaginationParams;

  return {
    capabilities: getPaginationResult(
      limit,
      startingAfter,
      endingBefore,
      BALANCE_CAPABILITIES,
      'id'
    ),
  };
}

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
    assetId: AssetIdQueryParam;
    nationalCurrencyCode: NationalCurrencyCodeQueryParam;
    cryptocurrencySymbol: CryptocurrencySymbolQueryParam;
  };

  if (!isKnownSubAccount(accountId)) {
    return ErrorFactory.notFound(reply);
  }

  try {
    validateAssetQueryParams(assetId, nationalCurrencyCode, cryptocurrencySymbol);
  } catch (err) {
    if (err instanceof InvalidAssetQueryCombinationError) {
      ErrorFactory.badRequest(reply, {
        message: err.message,
        errorType: BadRequestError.errorType.BAD_REQUEST,
      });
    }
    throw err;
  }

  return {
    balances: getPaginationResult(
      limit,
      startingAfter,
      endingBefore,
      getSubAccountBalances(accountId),
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
