/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { OrderSide } from './OrderSide';
import type { PositiveAmount } from './PositiveAmount';

export type MarketEntry = {
    id: string;
    /**
     * Amount of the base asset traded.
     */
    amount: PositiveAmount;
    price: PositiveAmount;
    totalPrice: PositiveAmount;
    side: OrderSide;
};

