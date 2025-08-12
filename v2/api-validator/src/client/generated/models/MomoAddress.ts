/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { AccountHolderDetails } from './AccountHolderDetails';
import type { MobilePhoneNumber } from './MobilePhoneNumber';
import type { MomoCapability } from './MomoCapability';

export type MomoAddress = (MomoCapability & {
    accountHolder: AccountHolderDetails;
    mobilePhoneNumber: MobilePhoneNumber;
    /**
     * Mobile money provider
     */
    provider: MomoAddress.provider;
    /**
     * Beneficiary document identification (may be required)
     */
    beneficiaryDocumentId?: string;
    /**
     * Relationship to beneficiary for AML purposes
     */
    beneficiaryRelationship?: string;
});

export namespace MomoAddress {

    /**
     * Mobile money provider
     */
    export enum provider {
        M_PESA = 'm-pesa',
        AIRTEL = 'airtel',
        MTN = 'mtn',
        TIGO = 'tigo',
        ORANGE = 'orange',
    }


}

