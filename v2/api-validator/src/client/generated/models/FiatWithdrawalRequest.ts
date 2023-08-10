/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { FiatTransferDestination } from './FiatTransferDestination';
import type { NationalCurrency } from './NationalCurrency';
import type { WithdrawalRequestCommonProperties } from './WithdrawalRequestCommonProperties';

export type FiatWithdrawalRequest = (WithdrawalRequestCommonProperties & {
    balanceAsset: NationalCurrency;
    destination: FiatTransferDestination;
});

