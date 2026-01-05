/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { LocalBankTransferAddress } from './LocalBankTransferAddress';
import type { PositiveAmount } from './PositiveAmount';

export type LocalBankTransferDestination = (LocalBankTransferAddress & {
amount: PositiveAmount;
});
