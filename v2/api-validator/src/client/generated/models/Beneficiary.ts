/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { BusinessIdentificationInfo } from './BusinessIdentificationInfo';
import type { PersonaIdentificationInfo } from './PersonaIdentificationInfo';

/**
 * Information about the beneficiary of the transaction.
 */
export type Beneficiary = ({
    personaIdentificationInfo?: PersonaIdentificationInfo;
} | {
    businessIdentificationInfo?: BusinessIdentificationInfo;
});

