/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { NationalCurrency } from './NationalCurrency';

export type ClabeCapability = {
    asset: NationalCurrency;
    transferMethod: ClabeCapability.transferMethod;
};

export namespace ClabeCapability {

    export enum transferMethod {
        CLABE = 'Clabe',
    }


}

