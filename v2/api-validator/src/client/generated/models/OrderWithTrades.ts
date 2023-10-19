/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { MarketTrade } from './MarketTrade';
import type { Order } from './Order';

export type OrderWithTrades = (Order & {
    trades: Array<MarketTrade>;
});

