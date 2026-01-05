/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { ApprovalRequest } from './ApprovalRequest';
import type { CollateralTransactionIntentStatus } from './CollateralTransactionIntentStatus';
import type { CryptocurrencyReference } from './CryptocurrencyReference';
import type { PositiveAmount } from './PositiveAmount';

export type CollateralDepositTransactionIntentResponse = {
id: string;
status: CollateralTransactionIntentStatus;
asset: CryptocurrencyReference;
amount: PositiveAmount;
approvalRequest: ApprovalRequest;
rejectionReason?: string;
};
