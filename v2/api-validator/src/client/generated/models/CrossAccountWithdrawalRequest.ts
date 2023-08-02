/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { CrossAccountTransferDestination } from './CrossAccountTransferDestination';
import type { WithdrawalRequestCommonProperties } from './WithdrawalRequestCommonProperties';

export type CrossAccountWithdrawalRequest = (WithdrawalRequestCommonProperties & {
    destination: CrossAccountTransferDestination;
});

