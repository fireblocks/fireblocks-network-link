/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { CryptocurrencyReference } from './CryptocurrencyReference';
import type { PublicBlockchainTransactionDestination } from './PublicBlockchainTransactionDestination';
import type { WithdrawalRequestCommonProperties } from './WithdrawalRequestCommonProperties';

export type BlockchainWithdrawalRequest = (WithdrawalRequestCommonProperties & {
    balanceAsset: CryptocurrencyReference;
    destination: PublicBlockchainTransactionDestination;
});

