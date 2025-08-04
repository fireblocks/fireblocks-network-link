/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { AssetReference } from './AssetReference';
import type { PositiveAmount } from './PositiveAmount';

export type AccountRate = {
    rate: PositiveAmount;
    baseAsset: AssetReference;
    quoteAsset: AssetReference;
    /**
     * In Milliseconds. The timestamp on the creation of the rate.
     */
    timestamp?: number;
};

