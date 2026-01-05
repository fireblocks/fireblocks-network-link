/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

/**
 * - **Pending** - The transaction is pending and has not been credited to the provider's account yet
 * - **Credited** - The transaction has been completed successfully and the account has been credited
 * - **Rejected** - The transaction has been rejected and the account has not been credited
 * 
 */
export enum CollateralDepositTransactionStatus {
    PENDING = 'Pending',
    CREDITED = 'Credited',
    REJECTED = 'Rejected',
}
