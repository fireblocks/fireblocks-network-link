/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

/**
 * - **NOT_FOUND** - The transaction was not found
 * - **PROCESSING** - The transaction is being processed
 * - **CANCELLED** - The transaction was cancelled
 * - **FAILED** - The transaction failed
 * - **PENDING_MANUAL_APPROVAL** - The transaction is pending manual approval
 * - **PENDING_SERVICE_MANUAL_APPROVAL** - The transaction is pending service manual approval
 * - **REJECTED** - The transaction was rejected
 * - **COMPLETED** - The transaction was completed
 * 
 */
export enum SettlementTransactionStatus {
    NOT_FOUND = 'NOT_FOUND',
    PROCESSING = 'PROCESSING',
    CANCELLED = 'CANCELLED',
    FAILED = 'FAILED',
    PENDING_MANUAL_APPROVAL = 'PENDING_MANUAL_APPROVAL',
    PENDING_SERVICE_MANUAL_APPROVAL = 'PENDING_SERVICE_MANUAL_APPROVAL',
    REJECTED = 'REJECTED',
    COMPLETED = 'COMPLETED',
}
