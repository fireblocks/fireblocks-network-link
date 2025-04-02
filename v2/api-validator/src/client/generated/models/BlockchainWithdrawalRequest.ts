/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { AssetReference } from './AssetReference';
import type { ParticipantsIdentification } from './ParticipantsIdentification';
import type { PublicBlockchainTransactionDestination } from './PublicBlockchainTransactionDestination';
import type { WithdrawalRequestCommonProperties } from './WithdrawalRequestCommonProperties';

export type BlockchainWithdrawalRequest = (WithdrawalRequestCommonProperties & {
    balanceAsset: AssetReference;
    destination: PublicBlockchainTransactionDestination;
    participantsIdentification?: ParticipantsIdentification;
});

