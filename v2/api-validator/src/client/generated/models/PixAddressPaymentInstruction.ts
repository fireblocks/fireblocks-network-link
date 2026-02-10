/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { PixAddress } from './PixAddress';

export type PixAddressPaymentInstruction = (PixAddress & {
    /**
     * PIX QR code
     */
    qrCode?: string;
    /**
     * Expiration for PIX Cobrança (optional, ISO 8601 format)
     */
    expirationDate?: string;
});

