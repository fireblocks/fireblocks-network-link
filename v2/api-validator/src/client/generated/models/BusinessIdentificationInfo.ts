/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { Address } from './Address';
import type { EntityType } from './EntityType';
import type { RelationshipType } from './RelationshipType';

/**
 * Buisness information about the beneficiary of the transaction.
 */
export type BusinessIdentificationInfo = {
    entityType?: EntityType;
    externalReferenceId?: string;
    relationshipType?: RelationshipType;
    businessName?: string;
    registrationNumber?: string;
    address?: Address;
};

