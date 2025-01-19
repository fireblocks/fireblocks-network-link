/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { PositiveAmount } from './PositiveAmount';
import type { PublicBlockchainAddress } from './PublicBlockchainAddress';

export type CollateralWithdrawalTransactionRequest = {
    /**
     * A unique identifier of the transaction to track. This field will contain information to help Fireblocks poll the status of the transaction from the provider.
     *
     */
    collateralTxId: string;
    amount: PositiveAmount;
    destinationAddress: PublicBlockchainAddress;
};

