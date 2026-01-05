/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { IbanCapability } from './IbanCapability';
import type { PublicBlockchainCapability } from './PublicBlockchainCapability';

export type DepositAddressCreationRequest = {
    idempotencyKey: string;
    transferMethod: (PublicBlockchainCapability | IbanCapability);
};
