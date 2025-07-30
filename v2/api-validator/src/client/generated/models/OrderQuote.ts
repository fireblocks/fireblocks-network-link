/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

export type OrderQuote = {
    quoteId: string;
    /**
     * If quote is expired, re-generate a new quote.
     */
    reQuote?: boolean;
    /**
     * The slippage tolerance for the order.
     */
    slippage?: number;
};

