/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { AccountHolderDetails } from './AccountHolderDetails';
import type { Clabe } from './Clabe';
import type { ClabeCapability } from './ClabeCapability';

export type ClabeAddress = (ClabeCapability & {
    accountHolder: AccountHolderDetails;
    clabe: Clabe;
    /**
     * Name of the bank
     */
    bankName?: string;
    /**
     * Beneficiary RFC for compliance purposes
     */
    beneficiaryRfc?: string;
});

