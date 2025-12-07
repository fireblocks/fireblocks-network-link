/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { PositiveAmount } from './PositiveAmount';

export type FixedFeeAmount = {
    amountType: FixedFeeAmount.amountType;
    amount: PositiveAmount;
};

export namespace FixedFeeAmount {

    export enum amountType {
        FIXED = 'FIXED',
    }


}

