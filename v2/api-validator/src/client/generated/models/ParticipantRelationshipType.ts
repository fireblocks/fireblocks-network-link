/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

/**
 * Defines the relationship between the Originator and the Beneficiary in a transaction.
 * - FirstParty: The Originator and Beneficiary are the same entity. - SecondParty: The Originator and Beneficiary have a direct relationship. - ThirdParty: The transaction involves an intermediary between the Originator and Beneficiary.
 */
export enum ParticipantRelationshipType {
    FIRST_PARTY = 'FirstParty',
    SECOND_PARTY = 'SecondParty',
    THIRD_PARTY = 'ThirdParty',
}
