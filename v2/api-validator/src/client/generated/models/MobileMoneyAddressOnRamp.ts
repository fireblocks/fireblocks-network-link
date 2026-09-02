/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { MobileMoneyAddressBase } from './MobileMoneyAddressBase';

/**
 * Mobile money address for on-ramp
 */
export type MobileMoneyAddressOnRamp = (MobileMoneyAddressBase & {
    /**
     * URL to redirect to after successful payment
     */
    successRedirectUrl?: string;
});

