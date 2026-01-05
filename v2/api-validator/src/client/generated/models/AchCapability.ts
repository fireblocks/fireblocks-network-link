/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { NationalCurrency } from './NationalCurrency';

export type AchCapability = {
    asset: NationalCurrency;
    transferMethod: AchCapability.transferMethod;
};

export namespace AchCapability {

    export enum transferMethod {
        ACH = 'Ach',
    }


}
