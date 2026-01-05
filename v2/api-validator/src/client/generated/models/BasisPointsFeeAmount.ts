/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

export type BasisPointsFeeAmount = {
    amountType: BasisPointsFeeAmount.amountType;
    /**
     * Basis points (bps) - 1 is 0.01% and 10000 is 100%
     */
    amount: number;
};

export namespace BasisPointsFeeAmount {

    export enum amountType {
        BASIS_POINTS = 'BASIS_POINTS',
    }


}
