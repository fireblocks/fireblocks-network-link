/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { PositiveAmount } from './PositiveAmount';
import type { WireAddress } from './WireAddress';

export type WireTransferDestination = (WireAddress & {
amount: PositiveAmount;
});
