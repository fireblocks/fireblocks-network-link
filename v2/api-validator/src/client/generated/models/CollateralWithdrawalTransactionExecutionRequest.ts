/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { CollateralWithdrawalTransactionStatus } from './CollateralWithdrawalTransactionStatus';

export type CollateralWithdrawalTransactionExecutionRequest = {
    status: CollateralWithdrawalTransactionStatus;
    /**
     * A unique identifier of the transaction to track. This field will contain information to help the provider poll the status of the transaction from Fireblocks.
     *
     */
    collateralTxId: string;
};

