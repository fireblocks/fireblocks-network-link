import {
  Blockchain,
  Layer1Cryptocurrency,
  MarketEntry,
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

export const asks: Record<string, MarketEntry[]> = {
  'BTC/USDC': [
    {
      id: 'EADAC726-414B-4C5B-B26A-8A616446BDB0',
      price: '29312.03',
      amount: '9.21634',
      totalPrice: '270149.63',
      asset: { assetId: 'f0844d82-7097-4521-95bc-d843724a893e' },
    },
    {
      id: '23631CE5-123B-4163-A6CD-6BF3CE5521C6',
      price: '29315.97',
      amount: '22.33346',
      totalPrice: '654727.04',
      asset: { assetId: 'f0844d82-7097-4521-95bc-d843724a893e' },
    },
    {
      id: '375C2D0A-2874-4FCE-A860-068856D05A87',
      price: '29316.95',
      amount: '9.30764',
      totalPrice: '272871.62',
      asset: { assetId: 'f0844d82-7097-4521-95bc-d843724a893e' },
    },
    {
      id: 'E577CE57-57BE-49F4-ACA9-DA8EA0F560BD',
      price: '29317.14',
      amount: '7.56552',
      totalPrice: '221799.41',
      asset: { assetId: 'f0844d82-7097-4521-95bc-d843724a893e' },
    },
    {
      id: '92946569-74FE-42BD-9898-CBD03A5D407B',
      price: '29317.38',
      amount: '9.87465',
      totalPrice: '289498.87',
      asset: { assetId: 'f0844d82-7097-4521-95bc-d843724a893e' },
    },
  ],
};

export const bids: Record<string, MarketEntry[]> = {
  'BTC/USDC': [
    {
      id: 'F69C17BB-9E2A-4159-8938-8B142F55B4BE',
      price: '29312.03',
      amount: '9.21634',
      totalPrice: '270149.63',
      asset: { assetId: 'f0844d82-7097-4521-95bc-d843724a893e' },
    },
    {
      id: 'E7042B8A-D467-4144-AC53-92C4A96C2A84',
      price: '29310.42',
      amount: '0.00091',
      totalPrice: '26.67',
      asset: { assetId: 'f0844d82-7097-4521-95bc-d843724a893e' },
    },
    {
      id: '6A3444BC-34D1-411B-B505-ADE557307C62',
      price: '29310.35',
      amount: '0.027',
      totalPrice: '791.38',
      asset: { assetId: 'f0844d82-7097-4521-95bc-d843724a893e' },
    },
    {
      id: '27C49660-AC51-409D-A6C9-5E5BB0FFFACE',
      price: '29310.34',
      amount: '0.4275',
      totalPrice: '12530.17',
      asset: { assetId: 'f0844d82-7097-4521-95bc-d843724a893e' },
    },
    {
      id: 'E776FAF0-B9BB-414B-8519-CB01D088FAC2',
      price: '29310.27',
      amount: '0.01412',
      totalPrice: '413.86',
      asset: { assetId: 'f0844d82-7097-4521-95bc-d843724a893e' },
    },
  ],
};
