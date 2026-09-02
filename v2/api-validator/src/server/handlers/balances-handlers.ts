import * as ErrorFactory from '../http-error-factory';
import { FastifyReply, FastifyRequest } from 'fastify';
import { UnknownAdditionalAssetError } from '../controllers/assets-controller';
import { getPaginationResult } from '../controllers/pagination-controller';
import {
  BalancesController,
  InvalidAssetQueryCombinationError,
} from '../controllers/balances-controller';
import {
  AssetIdQueryParam,
  BadRequestError,
  Balances,
  CryptocurrencySymbolQueryParam,
  NationalCurrencyCodeQueryParam,
  RequestPart,
} from '../../client/generated';
import { AccountIdPathParam, PaginationQuerystring } from './request-types';
import { ControllersContainer } from '../controllers/controllers-container';

type AssetQuery = {
  assetId?: AssetIdQueryParam;
  nationalCurrencyCode?: NationalCurrencyCodeQueryParam;
  cryptocurrencySymbol?: CryptocurrencySymbolQueryParam;
};
type AssetQuerystring = { Querystring: AssetQuery };
type BalancesResponse = { balances: Balances };
type BalancesBody = { Body: BalancesResponse };

const controllers = new ControllersContainer((accountId) => new BalancesController(accountId));

export async function getBalances(
  request: FastifyRequest<
    BalancesBody & AssetQuerystring & AccountIdPathParam & PaginationQuerystring
  >,
  reply: FastifyReply
): Promise<BalancesResponse> {
  const { accountId } = request.params;
  const {
    limit,
    startingAfter,
    endingBefore,
    assetId,
    nationalCurrencyCode,
    cryptocurrencySymbol,
  } = request.query;

  const controller = controllers.getController(accountId);
  if (!controller) {
    return ErrorFactory.notFound(reply);
  }

  try {
    controller.validateAssetQueryParams(assetId, nationalCurrencyCode, cryptocurrencySymbol);
  } catch (err) {
    if (err instanceof InvalidAssetQueryCombinationError) {
      return ErrorFactory.badRequest(reply, {
        message: err.message,
        errorType: BadRequestError.errorType.SCHEMA_ERROR,
        requestPart: RequestPart.QUERYSTRING,
      });
    }
    if (err instanceof UnknownAdditionalAssetError) {
      return ErrorFactory.badRequest(reply, {
        message: err.message,
        errorType: BadRequestError.errorType.UNKNOWN_ASSET,
        requestPart: RequestPart.QUERYSTRING,
      });
    }
    throw err;
  }

  if (assetId) {
    return { balances: controller.getSingleAssetBalance({ assetId }) };
  }
  if (nationalCurrencyCode) {
    return {
      balances: controller.getSingleAssetBalance({ nationalCurrencyCode }),
    };
  }
  if (cryptocurrencySymbol) {
    return {
      balances: controller.getSingleAssetBalance({ cryptocurrencySymbol }),
    };
  }

  return {
    balances: getPaginationResult(
      limit,
      startingAfter,
      endingBefore,
      controller.getSubAccountBalances(),
      'id'
    ),
  };
}
