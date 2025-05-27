/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { AccountHolderDetails } from './AccountHolderDetails';
import type { BankAccountNumber } from './BankAccountNumber';
import type { PostalAddress } from './PostalAddress';
import type { RoutingNumber } from './RoutingNumber';
import type { WireCapability } from './WireCapability';

export type WireAddress = (WireCapability & {
    accountHolder: AccountHolderDetails;
    bankName?: string;
    bankAccountNumber: BankAccountNumber;
    routingNumber: RoutingNumber;
    bankAddress?: PostalAddress;
});

