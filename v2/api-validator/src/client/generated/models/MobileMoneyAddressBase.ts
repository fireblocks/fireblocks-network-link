/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { MobileMoneyCapability } from './MobileMoneyCapability';
import type { MobilePhoneNumber } from './MobilePhoneNumber';

/**
 * Base mobile money address with beneficiary info (without redirect URLs)
 */
export type MobileMoneyAddressBase = (MobileMoneyCapability & {
    mobilePhoneNumber: MobilePhoneNumber;
    email: string;
    /**
     * Mobile money provider
     */
    provider: MobileMoneyAddressBase.provider;
});

export namespace MobileMoneyAddressBase {

    /**
     * Mobile money provider
     */
    export enum provider {
        M_PESA = 'm-pesa',
        AIRTEL = 'airtel',
        MTN = 'mtn',
        TIGO = 'tigo',
        ORANGE = 'orange',
        WAVE = 'wave',
    }


}

