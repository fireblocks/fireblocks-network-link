/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { PositiveAmount } from './PositiveAmount';
import type { PublicBlockchainAddress } from './PublicBlockchainAddress';

export type SettlementDepositInstruction = {
    /**
     * ID of the Fireblocks asset
     */
    fireblocksAssetId: string;
    amount: PositiveAmount;
    destinationAddress: PublicBlockchainAddress;
};

