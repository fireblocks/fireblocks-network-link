/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { NationalCurrency } from './NationalCurrency';

export type PrefundedFiatCapability = {
    asset: NationalCurrency;
    type: PrefundedFiatCapability.type;
};

export namespace PrefundedFiatCapability {

    export enum type {
        PREFUNDED = 'Prefunded',
    }


}

