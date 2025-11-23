/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { PositiveAmount } from './PositiveAmount';

export type FeeAmount = ({
    amountType: FeeAmount.amountType;
    amount: PositiveAmount;
} | {
    amountType: FeeAmount.amountType;
    /**
     * Basis points (bps) - 1 is 0.01% and 10000 is 100%
     */
    amount: number;
});

export namespace FeeAmount {

    export enum amountType {
        FIXED = 'FIXED',
    }


}

