/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { PayIdDetailsBase } from './PayIdDetailsBase';

export type PayIdDetailsOnRamp = (PayIdDetailsBase & {
    type: PayIdDetailsOnRamp.type;
    /**
     * PayId value
     */
    value: string;
    /**
     * BSB value
     */
    bsb?: string;
    /**
     * Account number value
     */
    accountNumber?: string;
});

export namespace PayIdDetailsOnRamp {

    export enum type {
        EMAIL = 'email',
    }


}

