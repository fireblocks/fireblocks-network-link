/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { AssetReference } from './AssetReference';
import type { PositiveAmount } from './PositiveAmount';
import type { QuoteStatus } from './QuoteStatus';

export type Quote = {
    id: string;
    fromAsset: AssetReference;
    fromAmount: PositiveAmount;
    toAsset: AssetReference;
    toAmount: PositiveAmount;
    /**
     * Conversion fee in basis points. The amounts are expected to include the fee.
     */
    conversionFeeBps: number;
    conversionFeeAsset?: AssetReference;
    status: QuoteStatus;
    /**
     * Quote creation time.
     */
    createdAt: string;
    /**
     * Quote expiration time.
     */
    expiresAt: string;
};

