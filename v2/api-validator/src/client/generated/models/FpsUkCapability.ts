/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { NationalCurrency } from './NationalCurrency';

export type FpsUkCapability = {
    asset: NationalCurrency;
    transferMethod: FpsUkCapability.transferMethod;
};

export namespace FpsUkCapability {

    export enum transferMethod {
        FPS_UK = 'FpsUk',
    }


}

