/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { AccountHolderDetails } from './AccountHolderDetails';

export type MobileMoneyAddressBeneficiaryInfo = {
    accountHolder: AccountHolderDetails;
    /**
     * Beneficiary document identification (may be required)
     */
    beneficiaryDocumentId?: string;
    /**
     * Relationship to beneficiary for AML purposes
     */
    beneficiaryRelationship?: string;
};

