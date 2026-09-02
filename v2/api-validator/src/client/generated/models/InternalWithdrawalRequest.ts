/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { AssetReference } from './AssetReference';
import type { InternalTransferDestination } from './InternalTransferDestination';
import type { WithdrawalRequestCommonProperties } from './WithdrawalRequestCommonProperties';

export type InternalWithdrawalRequest = (WithdrawalRequestCommonProperties & {
    balanceAsset: AssetReference;
    destination: InternalTransferDestination;
    /**
     * A unique identifier assigned by an external system to track the transaction or entity across different platforms.
     */
    referenceId?: string;
});

