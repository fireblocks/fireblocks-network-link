/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { AccountHolderDetails } from './AccountHolderDetails';
import type { bankAccountNumber } from './bankAccountNumber';
import type { PostalAddress } from './PostalAddress';
import type { routingNumber } from './routingNumber';
import type { WireCapability } from './WireCapability';

export type WireAddress = (WireCapability & {
    accountHolder: AccountHolderDetails;
    bankName?: string;
    bankAccountNumber: bankAccountNumber;
    routingNumber: routingNumber;
    bankAddress?: PostalAddress;
});

