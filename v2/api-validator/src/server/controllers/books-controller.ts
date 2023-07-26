import {
  Blockchain,
  Layer1Cryptocurrency,
  NationalCurrencyCode,
  OrderBook,
} from '../../client/generated';

export const books: OrderBook[] = [
  {
    id: 'BTC/USDC',
    description: 'Bitcoin book',
    baseAsset: {
      blockchain: Blockchain.BITCOIN,
      cryptocurrencySymbol: Layer1Cryptocurrency.BTC,
    },
    quoteAsset: {
      assetId: 'f0844d82-7097-4521-95bc-d843724a893e',
    },
  },
  {
    id: 'GBP/USDC',
    baseAsset: {
      nationalCurrencyCode: NationalCurrencyCode.GBP,
    },
    quoteAsset: {
      assetId: 'f0844d82-7097-4521-95bc-d843724a893e',
    },
  },
];
