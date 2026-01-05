/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { AccountHolderDetails } from './AccountHolderDetails';
import type { EuropeanSEPACapability } from './EuropeanSEPACapability';
import type { Iban } from './Iban';

export type EuropeanSEPAAddress = (EuropeanSEPACapability & {
accountHolder: AccountHolderDetails;
iban: Iban;
/**
 * Bank Identifier Code (SWIFT/BIC)
 */
bic?: string;
bankName?: string;
bankBranch?: string;
bankAddress?: string;
/**
 * ISO purpose code for the transfer
 */
purposeCode?: string;
/**
 * Beneficiary tax identification number
 */
taxId?: string;
});
