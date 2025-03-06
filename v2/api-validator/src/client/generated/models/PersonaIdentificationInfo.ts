/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { Address } from './Address';
import type { EntityType } from './EntityType';
import type { FullName } from './FullName';
import type { RelationshipType } from './RelationshipType';

/**
 * Individual information about the beneficiary of the transaction.
 */
export type PersonaIdentificationInfo = {
    entityType?: EntityType;
    externalReferenceId?: string;
    relationshipType?: RelationshipType;
    fullName?: FullName;
    dateOfBirth?: string;
    address?: Address;
};

