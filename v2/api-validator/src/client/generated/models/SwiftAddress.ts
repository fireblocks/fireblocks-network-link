/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { AccountHolderDetails } from './AccountHolderDetails';
import type { SwiftCapability } from './SwiftCapability';
import type { SwiftCode } from './SwiftCode';

export type SwiftAddress = (SwiftCapability & {
    accountHolder: AccountHolderDetails;
    swiftCode: SwiftCode;
    /**
     * Routing number identifying the bank account.
     */
    routingNumber: string;
});

