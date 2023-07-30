/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { PositiveAmount } from './PositiveAmount';

export type WithdrawalRequestCommonProperties = {
    idempotencyKey: string;
    /**
     * AssetBalance identifier returned from /accounts/{accountId}/balances
     */
    balanceId: string;
    balanceAmount: PositiveAmount;
};

