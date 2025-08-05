/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

export type OrderQuote = {
    type: OrderQuote.type;
    quoteId: string;
    /**
     * If quote is expired, re-generate a new quote.
     */
    reQuote?: OrderQuote.reQuote;
    /**
     * The slippage tolerance for the order.
     */
    slippage?: number;
};

export namespace OrderQuote {

    export enum type {
        QUOTE = 'Quote',
    }

    /**
     * If quote is expired, re-generate a new quote.
     */
    export enum reQuote {
        RETRY = 'Retry',
        MARKET = 'Market',
    }


}

