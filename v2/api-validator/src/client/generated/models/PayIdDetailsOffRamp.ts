/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { PayIdDetailsBase } from './PayIdDetailsBase';

export type PayIdDetailsOffRamp = (PayIdDetailsBase & {
    type?: PayIdDetailsOffRamp.type;
    /**
     * PayId value
     */
    value?: string;
    /**
     * BSB value
     */
    bsb: string;
    /**
     * Account number value
     */
    accountNumber: string;
});

export namespace PayIdDetailsOffRamp {

    export enum type {
        EMAIL = 'email',
    }


}

