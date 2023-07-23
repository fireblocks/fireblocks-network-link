/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { CrossAccountTransferCapability } from './CrossAccountTransferCapability';
import type { PositiveAmount } from './PositiveAmount';

export type CrossAccountTransferDestination = (CrossAccountTransferCapability & {
    accountId: string;
    amount: PositiveAmount;
});

