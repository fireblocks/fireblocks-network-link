/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { AccountHolderDetails } from './AccountHolderDetails';
import type { PixCapability } from './PixCapability';

export type PixAddress = (PixCapability & {
    accountHolder: AccountHolderDetails;
    pixKey: string;
    keyType: PixAddress.keyType;
    bankName?: string;
    bankCode?: string;
});

export namespace PixAddress {

    export enum keyType {
        CPF = 'cpf',
        CNPJ = 'cnpj',
        EMAIL = 'email',
        PHONE = 'phone',
        RANDOM = 'random',
    }


}

