/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { RecipientTransfer } from './RecipientTransfer';

export type InteracTransferDetails = {
    recipientTransfer: RecipientTransfer;
    autoDeposit: boolean;
    /**
     * if autoDeposit is false, this is required
     */
    securityQuestion?: string;
    /**
     * if autoDeposit is false, this is required
     */
    securityAnswer?: string;
    message?: string;
};

