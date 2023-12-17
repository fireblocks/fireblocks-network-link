/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { PeerAccountTransferCapability } from './PeerAccountTransferCapability';
import type { PositiveAmount } from './PositiveAmount';

export type PeerAccountTransferDestination = (PeerAccountTransferCapability & {
    accountId: string;
    amount: PositiveAmount;
});

