/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { BusinessIdentificationInfo } from './BusinessIdentificationInfo';
import type { PersonaIdentificationInfo } from './PersonaIdentificationInfo';

/**
 * An object that ensures the inclusion of either the originator or  beneficiary details for transactions.
 *
 */
export type ParticipantsIdentification = {
    /**
     * Information about the originator of the transaction.
     */
    originator?: (PersonaIdentificationInfo | BusinessIdentificationInfo);
    /**
     * Information about the beneficiary of the transaction.
     */
    beneficiary?: (PersonaIdentificationInfo | BusinessIdentificationInfo);
};

