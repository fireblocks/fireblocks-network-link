/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { PositiveAmount } from './PositiveAmount';
import type { SepaAddress } from './SepaAddress';

export type SepaTransferDestination = (SepaAddress & {
    amount: PositiveAmount;
});

