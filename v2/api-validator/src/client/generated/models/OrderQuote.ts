/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { Market } from './Market';
import type { Retry } from './Retry';

export type OrderQuote = {
    type?: OrderQuote.type;
    quoteId: string;
    reQuote: (Retry | Market);
};

export namespace OrderQuote {

    export enum type {
        QUOTE = 'Quote',
    }


}

