/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { Beneficiary } from './Beneficiary';
import type { Originator } from './Originator';

/**
 * An object that ensures the inclusion of either the originator or  beneficiary details for transactions subject to Travel Rule compliance.  This object is used to facilitate the secure exchange of information  between Virtual Asset Service Providers (VASPs) for qualifying transactions.
 */
export type TransactionParticipants = {
    originator?: Originator;
    beneficiary?: Beneficiary;
};

