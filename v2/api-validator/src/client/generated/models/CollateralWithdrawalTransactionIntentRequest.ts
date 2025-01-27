/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { IntentApprovalRequest } from './IntentApprovalRequest';
import type { PositiveAmount } from './PositiveAmount';
import type { PublicBlockchainAddress } from './PublicBlockchainAddress';

export type CollateralWithdrawalTransactionIntentRequest = {
    amount: PositiveAmount;
    destinationAddress: PublicBlockchainAddress;
    intentApprovalRequest: IntentApprovalRequest;
};

