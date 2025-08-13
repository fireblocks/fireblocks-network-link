/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { AbaAddress } from './AbaAddress';
import type { PositiveAmount } from './PositiveAmount';

export type AbaTransferDestination = (AbaAddress & {
    amount: PositiveAmount;
});

