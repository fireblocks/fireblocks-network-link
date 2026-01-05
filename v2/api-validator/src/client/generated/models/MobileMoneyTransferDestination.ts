/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { MobileMoneyAddress } from './MobileMoneyAddress';
import type { PositiveAmount } from './PositiveAmount';

export type MobileMoneyTransferDestination = (MobileMoneyAddress & {
amount: PositiveAmount;
});
