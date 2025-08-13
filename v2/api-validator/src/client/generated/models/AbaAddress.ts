/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { AbaCapability } from './AbaCapability';
import type { AccountHolderDetails } from './AccountHolderDetails';
import type { BankAccountNumber } from './BankAccountNumber';
import type { PostalAddress } from './PostalAddress';
import type { RoutingNumber } from './RoutingNumber';

export type AbaAddress = (AbaCapability & {
    accountHolder: AccountHolderDetails;
    accountNumber: BankAccountNumber;
    routingNumber?: RoutingNumber;
    /**
     * SWIFT/BIC code (mandatory for international wires)
     */
    swiftCode: string;
    /**
     * Name of the bank
     */
    bankName?: string;
    bankAddress?: PostalAddress;
    /**
     * Bank branch number
     */
    branchNumber?: string;
});

