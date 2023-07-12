/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { BaseAssetRequest } from './BaseAssetRequest';
import type { OrderSide } from './OrderSide';
import type { OrderTimeInForce } from './OrderTimeInForce';
import type { OrderType } from './OrderType';
import type { QuoteAssetRequest } from './QuoteAssetRequest';

export type OrderData = ({
    /**
     * ID of the order book.
     */
    bookId: string;
    side: OrderSide;
    orderType: OrderType;
    timeInForce: OrderTimeInForce;
} & (BaseAssetRequest | QuoteAssetRequest));

