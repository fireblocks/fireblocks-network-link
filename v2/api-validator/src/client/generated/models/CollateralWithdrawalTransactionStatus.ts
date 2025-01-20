/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

/**
 * - **Pending** - The withdrawal transaction is pending the provider's approval
 * - **Approved** - The withdrawal transaction has been approved and it is in progress
 * - **Rejected** - The withdrawal transaction has been rejected
 * - **Executed** - The withdrawal transaction has been executed
 *
 */
export enum CollateralWithdrawalTransactionStatus {
    PENDING = 'Pending',
    APPROVED = 'Approved',
    REJECTED = 'Rejected',
    EXECUTED = 'Executed',
}
