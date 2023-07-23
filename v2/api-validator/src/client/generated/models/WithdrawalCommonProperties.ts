/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { AssetReference } from './AssetReference';
import type { PositiveAmount } from './PositiveAmount';
import type { WithdrawalEvent } from './WithdrawalEvent';
import type { WithdrawalStatus } from './WithdrawalStatus';

export type WithdrawalCommonProperties = {
    id: string;
    balanceAsset: AssetReference;
    balanceAmount: PositiveAmount;
    status: WithdrawalStatus;
    /**
     * Time when the withdrawal was created.
     */
    createdAt: string;
    /**
     * Time when the withdrawal reached a final state.
     */
    finalizedAt?: string;
    events?: Array<WithdrawalEvent>;
};

