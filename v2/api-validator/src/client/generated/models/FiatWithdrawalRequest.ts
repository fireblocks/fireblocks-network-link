/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { AssetReference } from './AssetReference';
import type { FiatTransferDestination } from './FiatTransferDestination';
import type { WithdrawalRequestCommonProperties } from './WithdrawalRequestCommonProperties';

export type FiatWithdrawalRequest = (WithdrawalRequestCommonProperties & {
balanceAsset: AssetReference;
destination: FiatTransferDestination;
});
