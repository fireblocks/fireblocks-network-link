/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { SettlementDepositInstruction } from './SettlementDepositInstruction';
import type { SettlementTransactionStatus } from './SettlementTransactionStatus';

export type SettlementDepositTransaction = (SettlementDepositInstruction & {
    status: SettlementTransactionStatus;
    rejectionReason?: string;
});

