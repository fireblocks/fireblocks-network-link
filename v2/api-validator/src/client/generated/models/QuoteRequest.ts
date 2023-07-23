/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { PositiveAmount } from './PositiveAmount';
import type { QuoteCapability } from './QuoteCapability';

export type QuoteRequest = (QuoteCapability & ({
    fromAmount: PositiveAmount;
} | {
    toAmount: PositiveAmount;
}));

