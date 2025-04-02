/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

/**
 * Defines the relationship between the originator and the beneficiary in a transaction.
 * - FirstParty: The originator and beneficiary are the same entity. - SecondParty: The originator and beneficiary have a direct relationship. - ThirdParty: The transaction involves an intermediary between the originator and beneficiary.
 */
export enum ParticipantRelationshipType {
    FIRST_PARTY = 'FirstParty',
    SECOND_PARTY = 'SecondParty',
    THIRD_PARTY = 'ThirdParty',
}
