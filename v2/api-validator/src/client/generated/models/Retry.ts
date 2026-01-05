/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

export type Retry = {
    type: Retry.type;
    /**
     * Slippage tolerance in basis points (bps) for quote orders - 1 is 0.01% and 10000 is 100%
     */
    slippage: number;
    /**
     * If quote is expired, how many times to re-generate new quotes to try having the order executed as in the original quote.
     */
    count?: number;
};

export namespace Retry {

    export enum type {
        RETRY = 'Retry',
    }


}
