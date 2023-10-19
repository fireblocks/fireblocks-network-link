/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { OrderData } from './OrderData';
import type { OrderStatus } from './OrderStatus';

export type Order = (OrderData & {
    id: string;
    status: OrderStatus;
    /**
     * Time when the order was created.
     */
    createdAt: string;
    /**
     * Time when the order was finalized.
     */
    finalizedAt?: string;
});

