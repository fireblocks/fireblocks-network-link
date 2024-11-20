/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { CollateralWithdrawalTransactionStatus } from './CollateralWithdrawalTransactionStatus';

export type CollateralWithdrawalTransaction = {
    /**
     * A unique identifier of the transaction to track. This field will contain information to help Fireblocks poll the status of the transaction from the provider.
     *
     */
    collateralTxId: string;
    status: CollateralWithdrawalTransactionStatus;
    withdrawalTxBlockchainId?: string;
    rejectionReason?: string | null;
};

