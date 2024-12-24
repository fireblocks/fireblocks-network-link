/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { SettlementDepositInstruction } from './SettlementDepositInstruction';
import type { SettlementWithdrawInstruction } from './SettlementWithdrawInstruction';

export type SettlementInstructions = {
    settlementVersion: string;
    withdrawInstructions: Array<SettlementWithdrawInstruction>;
    depositInstructions: Array<SettlementDepositInstruction>;
};

