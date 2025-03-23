/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { PostalAddress } from './PostalAddress';
import type { RelationshipType } from './RelationshipType';

/**
 * Information related to the business entity acting as the beneficiary of the transaction.
 */
export type BusinessIdentificationInfo = {
    /**
     * A unique identifier assigned by an external system to track the transaction or entity across different platforms.
     */
    externalReferenceId?: string;
    entityType?: BusinessIdentificationInfo.entityType;
    relationshipType?: RelationshipType;
    /**
     * The legal name of the business entity as registered with the relevant authorities.
     */
    businessName?: string;
    /**
     * A unique identifier assigned to the business entity by the relevant regulatory authority, often used for tax and legal purposes.
     */
    registrationNumber?: string;
    postalAddress?: PostalAddress;
};

export namespace BusinessIdentificationInfo {

    export enum entityType {
        BUSINESS = 'Business',
    }


}

