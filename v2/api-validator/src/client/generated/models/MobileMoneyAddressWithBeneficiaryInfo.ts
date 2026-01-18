/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { AccountHolderDetails } from './AccountHolderDetails';
import type { MobileMoneyAddress } from './MobileMoneyAddress';
import type { Redirect } from './Redirect';

export type MobileMoneyAddressWithBeneficiaryInfo = (MobileMoneyAddress & {
    accountHolder: AccountHolderDetails;
    /**
     * Beneficiary document identification (may be required)
     */
    beneficiaryDocumentId?: string;
    /**
     * Relationship to beneficiary for AML purposes
     */
    beneficiaryRelationship?: string;
    redirect?: Redirect;
});

