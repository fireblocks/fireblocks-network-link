/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { ApprovalRequest } from './ApprovalRequest';
import type { CollateralTransactionIntentStatus } from './CollateralTransactionIntentStatus';
import type { PositiveAmount } from './PositiveAmount';
import type { PublicBlockchainAddress } from './PublicBlockchainAddress';

export type CollateralWithdrawalTransactionIntentResponse = {
    id: string;
    amount: PositiveAmount;
    destinationAddress: PublicBlockchainAddress;
    approvalRequest: ApprovalRequest;
    status: CollateralTransactionIntentStatus;
    rejectionReason?: string;
};
