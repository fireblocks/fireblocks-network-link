/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { SettlementTransactionStatus } from './SettlementTransactionStatus';
import type { SettlementWithdrawInstruction } from './SettlementWithdrawInstruction';

export type SettlementWithdrawTransaction = (SettlementWithdrawInstruction & {
    status: SettlementTransactionStatus;
    rejectionReason?: string | null;
});

