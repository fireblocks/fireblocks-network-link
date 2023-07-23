/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { AssetReference } from './AssetReference';
import type { TransferCapability } from './TransferCapability';

/**
 * Capability to deposit to a balance asset using a specific transfer capability.
 */
export type DepositCapability = {
    deposit: TransferCapability;
    balanceAsset: AssetReference;
};

