/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { NationalCurrency } from './NationalCurrency';

/**
 * PayId Transfer Capability
 */
export type PayIdCapability = {
    asset: NationalCurrency;
    transferMethod: PayIdCapability.transferMethod;
};

export namespace PayIdCapability {

    export enum transferMethod {
        PAY_ID = 'PayId',
    }


}

