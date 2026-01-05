/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { AssetReference } from './AssetReference';
import type { DepositStatus } from './DepositStatus';
import type { PositiveAmount } from './PositiveAmount';
import type { Transfer } from './Transfer';

export type Deposit = {
    id: string;
    balanceAsset: AssetReference;
    balanceAmount: PositiveAmount;
    source: Transfer;
    /**
     * ID of the deposit address, created by posting /transfers/deposits/addresses
     */
    depositAddressId?: string;
    status: DepositStatus;
    /**
     * Time when the deposit was created.
     */
    createdAt: string;
    /**
     * Time when the deposit reached a final state.
     */
    finalizedAt?: string;
};
