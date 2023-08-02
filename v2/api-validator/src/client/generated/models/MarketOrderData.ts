/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { OrderCommonProperties } from './OrderCommonProperties';

export type MarketOrderData = (OrderCommonProperties & {
    orderType: MarketOrderData.orderType;
});

export namespace MarketOrderData {

    export enum orderType {
        MARKET = 'MARKET',
    }


}

