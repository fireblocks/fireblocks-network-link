/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { AssetReference } from './AssetReference';
import type { TransferCapability } from './TransferCapability';

/**
 * Capability to withdraw a balance asset using a specific transfer capability.
 */
export type WithdrawalCapability = {
    withdrawal: TransferCapability;
    balanceAsset: AssetReference;
};

