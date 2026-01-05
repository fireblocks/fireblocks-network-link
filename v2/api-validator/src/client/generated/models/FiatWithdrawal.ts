/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { FiatTransfer } from './FiatTransfer';
import type { WithdrawalCommonProperties } from './WithdrawalCommonProperties';

export type FiatWithdrawal = (WithdrawalCommonProperties & {
destination: FiatTransfer;
});
