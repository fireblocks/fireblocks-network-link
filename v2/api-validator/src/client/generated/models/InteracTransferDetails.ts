/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { RecipientHandle } from './RecipientHandle';

export type InteracTransferDetails = {
    recipientHandle: RecipientHandle;
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

