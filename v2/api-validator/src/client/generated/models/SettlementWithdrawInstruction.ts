/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { PositiveAmount } from './PositiveAmount';
import type { PublicBlockchainAddress } from './PublicBlockchainAddress';

export type SettlementWithdrawInstruction = {
    amount: PositiveAmount;
    fee?: PositiveAmount;
    sourceAddress: PublicBlockchainAddress;
};

