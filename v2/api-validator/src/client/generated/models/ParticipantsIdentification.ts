/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { Beneficiary } from './Beneficiary';
import type { Originator } from './Originator';

/**
 * An object that ensures the inclusion of either the originator or  beneficiary details for transactions.
 *
 */
export type ParticipantsIdentification = {
    originator?: Originator;
    beneficiary?: Beneficiary;
};

