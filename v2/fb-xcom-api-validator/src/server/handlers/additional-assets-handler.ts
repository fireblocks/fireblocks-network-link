import { FastifyReply, FastifyRequest } from 'fastify';
import { AssetDefinition, Blockchain, Erc20Token, StellarToken } from '../../client/generated';
import logger from '../../logging';
import { PaginationParams, getPaginationResult, validatePaginationParams } from '../pagination';

const log = logger('handler:additional-assets');

export const SUPPORTED_ASSETS: AssetDefinition[] = [
  {
    id: '360de0ad-9ba1-45d5-8074-22453f193d65',
    type: Erc20Token.type.ERC20TOKEN,
    blockchain: Blockchain.ETHEREUM,
    contractAddress: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
    name: 'USDC',
    symbol: 'USDC',
    description:
      'USDC is a fully collateralized US Dollar stablecoin developed by CENTRE, the open source project with Circle being the first of several forthcoming issuers.',
    decimalPlaces: 6,
  },
  {
    id: '606bce6b-ff15-4704-9390-b9e32a6cfcff',
    type: Erc20Token.type.ERC20TOKEN,
    blockchain: Blockchain.POLYGON_PO_S,
    contractAddress: '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174',
    name: 'USDC',
    symbol: 'USDC',
    description:
      'USD Coin is an ERC-20 stablecoin brought to you by Circle and Coinbase. It is issued by regulated and licensed financial institutions that maintain full reserves of the equivalent fiat currency.',
    decimalPlaces: 6,
  },
  {
    id: '4386cf4d-83b2-4410-96da-0d3919a45506',
    type: StellarToken.type.STELLAR_TOKEN,
    blockchain: Blockchain.STELLAR,
    issuerAddress: 'GA5ZSEJYB37JRC5AVCIA5MOP4RHTM335X2KGX3IHOJAPP5RE34K4KZVN',
    stellarCurrencyCode: 'USDC',
    name: 'USDC',
    symbol: 'USDC',
    description:
      'USDC is a fully collateralized US Dollar stablecoin, based on the open source fiat stablecoin framework developed by Centre.',
    decimalPlaces: 2,
  },
];

export async function handleGetAdditionalAssets(
  request: FastifyRequest,
  reply: FastifyReply
): Promise<{ assets: AssetDefinition[] } | void> {
  const paginationParams = request.query as PaginationParams;

  log.info('GetAdditionalAssets');
  const { valid, error } = validatePaginationParams(
    paginationParams.limit,
    paginationParams.startingAfter,
    paginationParams.endingBefore
  );

  if (!valid) {
    reply.code(400).send(error);
    return;
  }

  const result = getPaginationResult(
    paginationParams.limit,
    paginationParams.startingAfter,
    paginationParams.endingBefore,
    SUPPORTED_ASSETS,
    'id'
  );

  return { assets: result };
}
