/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { WithdrawalStatus } from './WithdrawalStatus';

/**
 * Describes an event during withdrawal processing. The granularity and verbosity of the events it at the discretion of the API implementor.
 */
export type WithdrawalEvent = {
    status: WithdrawalStatus;
    message: string;
    /**
     * Time when the withdrawal was created.
     */
    createdAt: string;
};
