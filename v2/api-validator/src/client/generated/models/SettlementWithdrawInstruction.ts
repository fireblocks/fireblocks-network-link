/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { PositiveAmount } from './PositiveAmount';
import type { PublicBlockchainAddress } from './PublicBlockchainAddress';

export type SettlementWithdrawInstruction = {
    /**
     * ID of the Fireblocks asset
     */
    fireblocksAssetId: string;
    amount: PositiveAmount;
    fee?: PositiveAmount;
    sourceAddress: PublicBlockchainAddress;
};

