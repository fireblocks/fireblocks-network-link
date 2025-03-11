/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { NationalCountryCode } from './NationalCountryCode';

/**
 * A postal address in free-form text, containing details like street, building number, postal code, city, subdivision, and  country.
 */
export type PostalAddress = {
    /**
     * Name of a street or thoroughfare
     */
    streetName?: string;
    /**
     * Number that identifies the position of a building on a street
     */
    buildingNumber?: string;
    /**
     * Identifier consisting of a group of letters and/or numbers added to a postal address to assist the sorting of mail
     */
    postalCode?: string;
    /**
     * Name of a built-up area, with defined boundaries, and a local government.
     */
    city?: string;
    /**
     * Identifies a subdivision of a country such as state, region, or province.
     */
    subdivision?: string;
    /**
     * Identifies a subdivision within a country subdivision.
     */
    district?: string;
    country?: NationalCountryCode;
};

