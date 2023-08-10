/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { AssetReference } from './AssetReference';
import type { PositiveAmount } from './PositiveAmount';

export type QuoteRequest = ({
    fromAsset: AssetReference;
    toAsset: AssetReference;
} & ({
    fromAmount: PositiveAmount;
} | {
    toAmount: PositiveAmount;
}));

