/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { CryptocurrencyReference } from './CryptocurrencyReference';
import type { IntentApprovalRequest } from './IntentApprovalRequest';
import type { PositiveAmount } from './PositiveAmount';

export type CollateralDepositTransactionIntentRequest = {
    asset: CryptocurrencyReference;
    amount: PositiveAmount;
    intentApprovalRequest: IntentApprovalRequest;
};

