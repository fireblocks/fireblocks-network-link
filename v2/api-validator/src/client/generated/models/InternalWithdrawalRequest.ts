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
});

