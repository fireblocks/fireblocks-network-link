/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { AccountHolderDetails } from './AccountHolderDetails';
import type { MobileMoneyCapability } from './MobileMoneyCapability';
import type { MobilePhoneNumber } from './MobilePhoneNumber';

export type MobileMoneyAddress = (MobileMoneyCapability & {
    accountHolder: AccountHolderDetails;
    mobilePhoneNumber: MobilePhoneNumber;
    /**
     * Mobile money provider
     */
    provider: MobileMoneyAddress.provider;
    /**
     * Beneficiary document identification (may be required)
     */
    beneficiaryDocumentId?: string;
    /**
     * Relationship to beneficiary for AML purposes
     */
    beneficiaryRelationship?: string;
});

export namespace MobileMoneyAddress {

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

