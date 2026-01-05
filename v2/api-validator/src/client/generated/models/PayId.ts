/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

export type PayId = {
    type?: PayId.type;
    /**
     * PayId value
     */
    value?: string;
    /**
     * BSB value
     */
    bsb?: string;
    /**
     * Account number value
     */
    accountNumber?: string;
};

export namespace PayId {

    export enum type {
        EMAIL = 'EMAIL',
    }


}

