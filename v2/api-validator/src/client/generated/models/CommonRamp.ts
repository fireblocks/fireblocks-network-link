/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { PositiveAmount } from './PositiveAmount';

export type CommonRamp = {
    id: string;
    createdAt: string;
    updatedAt: string;
    status: CommonRamp.status;
    amount?: PositiveAmount;
};

export namespace CommonRamp {

    export enum status {
        CREATED = 'Created',
        PENDING_DELIVERY = 'PendingDelivery',
        DELIVERY_RECEIVED = 'DeliveryReceived',
        RECEIPT_SUBMITTED = 'ReceiptSubmitted',
        COMPLETED = 'Completed',
        FAILED = 'Failed',
    }


}

