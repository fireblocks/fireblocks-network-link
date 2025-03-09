/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { NationalCountryCode } from './NationalCountryCode';

/**
 * A postal address in free-form text, containing details like street, building number, postal code, city, state, province, district, and  country.
 */
export type PostalAddress = {
    streetName?: string;
    buildingNumber?: string;
    postalCode?: string;
    city?: string;
    /**
     * Identifies a subdivision of a country such as state, region, or province.
     */
    subdivision?: string;
    district?: string;
    country?: NationalCountryCode;
};

