/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

/**
 * Indicates the transfer destination policy:
 * `AnyAccount`: Transfer is possible to any account of the same user.
 * `DirectParentAccount`: Transfer is possible for the direct parent only.
 */
export enum InternalTransferDestinationPolicy {
    ANY_ACCOUNT = 'AnyAccount',
    DIRECT_PARENT_ACCOUNT = 'DirectParentAccount',
}
