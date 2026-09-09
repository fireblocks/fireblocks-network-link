/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { NationalCurrency } from './NationalCurrency';

export type AchCapability = {
    asset: NationalCurrency;
    transferMethod: AchCapability.transferMethod;
    /**
     * Identifier of the payer's bank, required for PSE-routed Ach on-ramps (e.g. COP). Not applicable to standard Ach transfers.
     *
     */
    bankId?: string;
};

export namespace AchCapability {

    export enum transferMethod {
        ACH = 'Ach',
    }


}

