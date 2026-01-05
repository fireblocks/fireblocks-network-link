/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { AchAddress } from './AchAddress';
import type { PositiveAmount } from './PositiveAmount';

export type AchTransferDestination = (AchAddress & {
amount: PositiveAmount;
});
