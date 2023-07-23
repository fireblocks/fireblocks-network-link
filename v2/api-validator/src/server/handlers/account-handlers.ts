import { FastifyReply, FastifyRequest } from 'fastify';
import {
  Account,
  AccountPropertiesQueryParam,
  AccountStatus,
  AssetReference,
  Balances,
  ErrorType,
  SubAccountIdPathParam,
} from '../../client/generated';
import {
  ENDING_STARTING_COMBINATION_ERROR,
  InvalidPaginationParamsCombinationError,
  PaginationParams,
  getPaginationResult,
} from '../controllers/pagination-controller';
import { getPartialAccountByQuery } from '../controllers/accounts-controller';

const ACCOUNT_NOT_FOUND_ERROR = {
  message: 'Account not found',
  errorType: ErrorType.NOT_FOUND,
};

const BALANCES: Balances = [];

const ACCOUNTS: Account[] = [
  { id: '1', balances: BALANCES, status: AccountStatus.ACTIVE, title: '', description: '' },
  { id: '2', balances: BALANCES, status: AccountStatus.INACTIVE, title: '', description: '' },
  { id: '3', balances: BALANCES, status: AccountStatus.ACTIVE, title: '', description: '' },
  { id: '4', balances: BALANCES, status: AccountStatus.ACTIVE, title: '', description: '' },
  { id: '5', balances: BALANCES, status: AccountStatus.ACTIVE, title: '', description: '' },
];

export async function handleGetAccounts(
  request: FastifyRequest,
  reply: FastifyReply
): Promise<{ withdrawals: Partial<Account>[] }> {
  const requestQuery = request.query as PaginationParams & { assets?: AccountPropertiesQueryParam };

  try {
    const page = getPaginationResult(
      requestQuery.limit,
      requestQuery.startingAfter,
      requestQuery.endingBefore,
      ACCOUNTS,
      'id'
    );

    return { withdrawals: getPartialAccountByQuery(page, requestQuery.assets) };
  } catch (err) {
    if (err instanceof InvalidPaginationParamsCombinationError) {
      return reply.code(400).send(ENDING_STARTING_COMBINATION_ERROR);
    }
    return reply.code(500).send({ errorType: ErrorType.UNEXPECTED_ERROR });
  }
}

export async function handleGetAccountDetails(
  request: FastifyRequest,
  reply: FastifyReply
): Promise<Account> {
  const params = request.params as { accountId: SubAccountIdPathParam };
  const asset = ACCOUNTS.find((account) => account.id === params.accountId);

  if (!asset) {
    return reply.code(404).send(ACCOUNT_NOT_FOUND_ERROR);
  }

  return asset;
}

export async function handleGetBalances(
  request: FastifyRequest,
  reply: FastifyReply
): Promise<{ balances: Balances }> {
  const params = request.params as { accountId: SubAccountIdPathParam };
  const requestQuery = request.query as PaginationParams & { asset?: AssetReference };

  if (requestQuery.asset) {
    if ('nationalCurrencyCode' in requestQuery.asset) {
      return {
        balances: [
          {
            asset: { nationalCurrencyCode: requestQuery.asset.nationalCurrencyCode },
            id: '1',
            availableAmount: '123',
          },
        ],
      };
    }
    if ('cryptocurrencySymbol' in requestQuery.asset) {
      return {
        balances: [
          {
            asset: { cryptocurrencySymbol: requestQuery.asset.cryptocurrencySymbol },
            id: '2',
            availableAmount: '123',
          },
        ],
      };
    }
    if ('assetId' in requestQuery.asset) {
      return {
        balances: [
          {
            asset: { assetId: requestQuery.asset.assetId },
            id: '3',
            availableAmount: '123',
          },
        ],
      };
    }
  }

  try {
    const accountBalances = ACCOUNTS.find((account) => account.id === params.accountId)?.balances;
    if (!accountBalances) {
      return { balances: [] };
    }
    const page = getPaginationResult(
      requestQuery.limit,
      requestQuery.startingAfter,
      requestQuery.endingBefore,
      accountBalances,
      'id'
    );

    return { balances: page };
  } catch (err) {
    if (err instanceof InvalidPaginationParamsCombinationError) {
      return reply.code(400).send(ENDING_STARTING_COMBINATION_ERROR);
    }
    return reply.code(500).send({ errorType: ErrorType.UNEXPECTED_ERROR });
  }
}

export async function handleGetHistoricBalances(
  request: FastifyRequest,
  reply: FastifyReply
): Promise<{ balances: Balances }> {
  const params = request.params as { accountId: SubAccountIdPathParam };
  const requestQuery = request.query as PaginationParams & { asset?: AssetReference; time: string };

  if (requestQuery.asset) {
    if ('nationalCurrencyCode' in requestQuery.asset) {
      return {
        balances: [
          {
            asset: { nationalCurrencyCode: requestQuery.asset.nationalCurrencyCode },
            id: '1',
            availableAmount: '123',
          },
        ],
      };
    }
    if ('cryptocurrencySymbol' in requestQuery.asset) {
      return {
        balances: [
          {
            asset: { cryptocurrencySymbol: requestQuery.asset.cryptocurrencySymbol },
            id: '2',
            availableAmount: '123',
          },
        ],
      };
    }
    if ('assetId' in requestQuery.asset) {
      return {
        balances: [
          {
            asset: { assetId: requestQuery.asset.assetId },
            id: '3',
            availableAmount: '123',
          },
        ],
      };
    }
  }

  try {
    const accountBalances = ACCOUNTS.find((account) => account.id === params.accountId)?.balances;
    if (!accountBalances) {
      return { balances: [] };
    }
    const page = getPaginationResult(
      requestQuery.limit,
      requestQuery.startingAfter,
      requestQuery.endingBefore,
      accountBalances,
      'id'
    );

    return { balances: page };
  } catch (err) {
    if (err instanceof InvalidPaginationParamsCombinationError) {
      return reply.code(400).send(ENDING_STARTING_COMBINATION_ERROR);
    }
    return reply.code(500).send({ errorType: ErrorType.UNEXPECTED_ERROR });
  }
}
