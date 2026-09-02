/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { FullName } from './FullName';
import type { MobilePhoneNumber } from './MobilePhoneNumber';
import type { ParticipantRelationshipType } from './ParticipantRelationshipType';
import type { PersonalIdentificationType } from './PersonalIdentificationType';
import type { PostalAddress } from './PostalAddress';

/**
 * Individual information about the beneficiary of the transaction.
 */
export type PersonaIdentificationInfo = {
    /**
     * A unique identifier assigned by an external system to track the transaction or entity across different platforms.
     */
    externalReferenceId?: string;
    entityType?: PersonaIdentificationInfo.entityType;
    participantRelationshipType?: ParticipantRelationshipType;
    fullName?: FullName;
    dateOfBirth?: string;
    postalAddress?: PostalAddress;
    email?: string;
    phone?: MobilePhoneNumber;
    /**
     * A unique identifier assigned to the individual by the relevant regulatory authority.
     */
    idNumber?: string;
    idType?: PersonalIdentificationType;
    /**
     * An additional unique identifier assigned to the individual by the relevant regulatory authority.
     */
    additionalIdNumber?: string;
    additionalIdType?: PersonalIdentificationType;
};

export namespace PersonaIdentificationInfo {

    export enum entityType {
        INDIVIDUAL = 'Individual',
    }


}

