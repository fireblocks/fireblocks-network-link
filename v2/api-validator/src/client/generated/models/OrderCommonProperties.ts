/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { OrderSide } from './OrderSide';
import type { OrderTimeInForce } from './OrderTimeInForce';
import type { PositiveAmount } from './PositiveAmount';

export type OrderCommonProperties = {
    /**
     * ID of the order book.
     */
    bookId: string;
    side: OrderSide;
    timeInForce: OrderTimeInForce;
    baseAssetQuantity: PositiveAmount;
};

