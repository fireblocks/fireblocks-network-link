/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { AccountHolderDetails } from './AccountHolderDetails';
import type { Iban } from './Iban';
import type { IbanCapability } from './IbanCapability';

export type IbanAddress = (IbanCapability & {
accountHolder: AccountHolderDetails;
iban: Iban;
});
