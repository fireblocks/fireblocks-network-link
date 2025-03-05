/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { NationalCurrencyCode } from './NationalCurrencyCode';

/**
 * Information that locates and identifies a specific address, presented in free format text.
 */
export type Address = {
    streetName?: string;
    buildingNumber?: string;
    postalCode?: string;
    city?: string;
    state?: string;
    province?: string;
    district?: string;
    country?: NationalCurrencyCode;
};

