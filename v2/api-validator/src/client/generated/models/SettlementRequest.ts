/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

/**
 * Settlement to be created
 */
export type SettlementRequest = {
    settlementId: string;
    /**
     * A unique identifier of the settlement state version. This field is optional and can be used to indicate the version of the settlement state the client is referring to.
     *
     */
    settlementVersion: string;
};

