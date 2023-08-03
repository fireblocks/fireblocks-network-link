/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { AssetReference } from './AssetReference';
import type { PositiveAmount } from './PositiveAmount';
import type { TransferCapability } from './TransferCapability';

/**
 * Capability to withdraw a balance asset using a specific transfer capability. `minWithdrawalAmount` is the minimum amount of the balance currency that can be withdrawn using this capability. If `minWithdrawalAmount` is not specified, it will be assumed that the minimum withdrawal amount is zero.
 */
export type WithdrawalCapability = {
    id: string;
    withdrawal: TransferCapability;
    balanceAsset: AssetReference;
    minWithdrawalAmount?: PositiveAmount;
};

