/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { ApprovalRequest } from './ApprovalRequest';
import type { CollateralWithdrawalTransactionStatus } from './CollateralWithdrawalTransactionStatus';

export type CollateralWithdrawalTransaction = {
    id: string;
    status: CollateralWithdrawalTransactionStatus;
    collateralTxId: string;
    approvalRequest: ApprovalRequest;
    rejectionReason?: string;
};

