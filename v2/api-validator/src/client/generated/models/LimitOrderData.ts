/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { OrderCommonProperties } from './OrderCommonProperties';
import type { PositiveAmount } from './PositiveAmount';

export type LimitOrderData = (OrderCommonProperties & {
    orderType: LimitOrderData.orderType;
    quoteAssetPrice: PositiveAmount;
});

export namespace LimitOrderData {

    export enum orderType {
        LIMIT = 'LIMIT',
    }


}

