/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { SettlementDepositTransaction } from './SettlementDepositTransaction';
import type { SettlementWithdrawTransaction } from './SettlementWithdrawTransaction';

export type SettlementState = {
    settlementVersion: string;
    withdrawTransactions?: Array<SettlementWithdrawTransaction>;
    depositTransactions?: Array<SettlementDepositTransaction>;
    /**
     * - **Invalid** - The settlement state is invalid and cannot be processed, usually due to balance changes
 * - **Pending** - The settlement is pending and has not started yet
 * - **InProgress** - The settlement is in progress
 * - **Completed** - The settlement has been completed successfully
 * - **Failed** - The settlement has failed
 * 
     */
    status: SettlementState.status;
};

export namespace SettlementState {

    /**
     * - **Invalid** - The settlement state is invalid and cannot be processed, usually due to balance changes
 * - **Pending** - The settlement is pending and has not started yet
 * - **InProgress** - The settlement is in progress
 * - **Completed** - The settlement has been completed successfully
 * - **Failed** - The settlement has failed
 * 
     */
    export enum status {
        INVALID = 'Invalid',
        PENDING = 'Pending',
        IN_PROGRESS = 'InProgress',
        COMPLETED = 'Completed',
        FAILED = 'Failed',
    }


}
