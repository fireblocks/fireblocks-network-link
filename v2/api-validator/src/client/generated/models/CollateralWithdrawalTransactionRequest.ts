/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { ApprovalRequest } from './ApprovalRequest';
import type { CollateralWithdrawalSettlementTransaction } from './CollateralWithdrawalSettlementTransaction';

export type CollateralWithdrawalTransactionRequest = {
    collateralTxId: string;
    approvalRequest: ApprovalRequest;
    settlementDetails?: CollateralWithdrawalSettlementTransaction;
};

