/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { CrossAccountTransfer } from './CrossAccountTransfer';
import type { WithdrawalCommonProperties } from './WithdrawalCommonProperties';

export type CrossAccountWithdrawal = (WithdrawalCommonProperties & {
    destination: CrossAccountTransfer;
});

