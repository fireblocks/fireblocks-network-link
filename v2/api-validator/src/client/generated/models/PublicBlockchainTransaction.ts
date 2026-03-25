/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { PublicBlockchainTransactionDestination } from './PublicBlockchainTransactionDestination';

/**
 * Blockchain transaction details. When the withdrawal or deposit has succeeded, `blockchainTxId` (transaction hash) is required and must be non-empty, although it is indicated as optional in the schema.
 */
export type PublicBlockchainTransaction = (PublicBlockchainTransactionDestination & {
    /**
     * Transaction hash on the blockchain. Required (non-empty) when the transaction has succeeded.
     */
    blockchainTxId?: string;
});

