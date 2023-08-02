/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { FiatTransferDestination } from './FiatTransferDestination';
import type { WithdrawalRequestCommonProperties } from './WithdrawalRequestCommonProperties';

export type FiatWithdrawalRequest = (WithdrawalRequestCommonProperties & {
    destination: FiatTransferDestination;
});

