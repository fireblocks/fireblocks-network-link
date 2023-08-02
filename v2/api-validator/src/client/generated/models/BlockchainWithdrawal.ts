/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { PublicBlockchainTransaction } from './PublicBlockchainTransaction';
import type { WithdrawalCommonProperties } from './WithdrawalCommonProperties';

export type BlockchainWithdrawal = (WithdrawalCommonProperties & {
    destination: PublicBlockchainTransaction;
});

