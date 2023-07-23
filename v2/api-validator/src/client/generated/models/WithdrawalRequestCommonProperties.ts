/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { AssetReference } from './AssetReference';
import type { PositiveAmount } from './PositiveAmount';

export type WithdrawalRequestCommonProperties = {
    idempotencyKey: string;
    balanceAsset: AssetReference;
    balanceAmount: PositiveAmount;
};

