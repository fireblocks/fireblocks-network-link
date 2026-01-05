/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { NationalCurrency } from './NationalCurrency';

export type WireCapability = {
    asset: NationalCurrency;
    transferMethod: WireCapability.transferMethod;
};

export namespace WireCapability {

    export enum transferMethod {
        WIRE = 'Wire',
    }


}
