/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

export type AccountHolderDetails = {
    /**
     * Full name of the account holder.
     */
    name: string;
    city?: string;
    /**
     * Country code, as specified in ISO 3166-1 alpha-2.
     */
    country?: string;
    /**
     * Country administrative subdivision, as specified in ISO 3166-2.
     */
    subdivision?: string;
    /**
     * Account holder street address.
     */
    address?: string;
    postalCode?: string;
};
