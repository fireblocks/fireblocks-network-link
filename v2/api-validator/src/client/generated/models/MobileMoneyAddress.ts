/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { MobileMoneyCapability } from './MobileMoneyCapability';
import type { MobilePhoneNumber } from './MobilePhoneNumber';

export type MobileMoneyAddress = (MobileMoneyCapability & {
    mobilePhoneNumber: MobilePhoneNumber;
    email: string;
    /**
     * Mobile money provider
     */
    provider: MobileMoneyAddress.provider;
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

