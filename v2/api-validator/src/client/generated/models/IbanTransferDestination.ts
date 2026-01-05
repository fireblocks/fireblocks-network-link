/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { IbanAddress } from './IbanAddress';
import type { PositiveAmount } from './PositiveAmount';

export type IbanTransferDestination = (IbanAddress & {
amount: PositiveAmount;
});
