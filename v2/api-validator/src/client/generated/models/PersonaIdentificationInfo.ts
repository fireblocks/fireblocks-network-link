/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { FullName } from './FullName';
import type { PostalAddress } from './PostalAddress';
import type { RelationshipType } from './RelationshipType';

/**
 * Individual information about the beneficiary of the transaction.
 */
export type PersonaIdentificationInfo = {
    /**
     * A unique identifier assigned by an external system to track the transaction or entity across different platforms.
     */
    externalReferenceId?: string;
    relationshipType?: RelationshipType;
    fullName?: FullName;
    dateOfBirth?: string;
    postalAddress?: PostalAddress;
};

