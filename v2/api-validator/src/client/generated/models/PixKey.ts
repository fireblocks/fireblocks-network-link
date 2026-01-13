/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

export type PixKey = {
    type: PixKey.type;
    /**
     * PIX value
     */
    value: string;
};

export namespace PixKey {

    export enum type {
        CPF = 'cpf',
        CNPJ = 'cnpj',
        EMAIL = 'email',
        PHONE = 'phone',
        RANDOM = 'random',
    }


}

