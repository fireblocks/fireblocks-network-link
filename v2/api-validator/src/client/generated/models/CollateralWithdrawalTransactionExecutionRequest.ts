/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { PositiveAmount } from './PositiveAmount';
import type { PublicBlockchainAddress } from './PublicBlockchainAddress';

export type CollateralWithdrawalTransactionExecutionRequest = {
    /**
     * A unique identifier of the initiateCollateralWithdrawal entityId created by the provider. This field will contain information to help the provider make the connection between initiateCollateralWithdrawal (eligiblity verification) id and Fireblocks collateral transaction.
     *
     */
    withdrawalId: string;
    /**
     * A unique identifier of the transaction to track. This field will contain information to help the provider poll the status of the transaction from Fireblocks.
     *
     */
    collateralTxId: string;
    amount: PositiveAmount;
    destinationAddress: PublicBlockchainAddress;
};

