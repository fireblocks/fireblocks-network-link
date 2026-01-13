/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { PixKey } from './PixKey';

export type Pix = {
    key: PixKey;
    /**
     * PIX QR code
     */
    qrCode?: string;
    /**
     * Expiration for PIX Cobrança (optional, ISO 8601 format)
     */
    expirationDate?: string;
};

