/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { CollateralDepositTransactionStatus } from './CollateralDepositTransactionStatus';
import type { PositiveAmount } from './PositiveAmount';

export type CollateralDepositTransaction = {
    /**
     * A unique identifier of the transaction to track. This field will contain information to help the provider poll the status of the transaction from Fireblocks.
     *
     */
    collateralTxId: string;
    /**
     * ID of the Fireblocks asset
     */
    fireblocksAssetId: string;
    amount?: PositiveAmount;
    status?: CollateralDepositTransactionStatus;
};

