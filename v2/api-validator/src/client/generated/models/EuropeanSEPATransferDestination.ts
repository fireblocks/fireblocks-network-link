/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { EuropeanSEPAAddress } from './EuropeanSEPAAddress';
import type { PositiveAmount } from './PositiveAmount';

export type EuropeanSEPATransferDestination = (EuropeanSEPAAddress & {
    amount: PositiveAmount;
});

