/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Rate } from '../models/Rate';

import type { CancelablePromise } from '../core/CancelablePromise';
import type { BaseHttpRequest } from '../core/BaseHttpRequest';

export class RatesService {

    constructor(public readonly httpRequest: BaseHttpRequest) {}

    /**
     * Get rate by account and assets
     * @returns Rate Rate by pair id.
     * @throws ApiError
     */
    public getRateByAccountAndAssets({
        xFbapiKey,
        xFbapiNonce,
        xFbapiTimestamp,
        xFbapiSignature,
        accountId,
        conversionPairId,
        rampsPairId,
        orderBookPairId,
    }: {
        /**
         * API authentication key.
         */
        xFbapiKey: string,
        /**
         * Unique identifier of the request.
         */
        xFbapiNonce: string,
        /**
         * Request timestamp in milliseconds since Unix epoch.
         */
        xFbapiTimestamp: number,
        /**
         * Request signature using the chosen cryptographic algorithm. The signature is to be calculated on concatenation of the following request fields in the specified order:
         * - `X-FBAPI-TIMESTAMP` - `X-FBAPI-NONCE` - HTTP request method in upper case - Endpoint path, including the query parameters - Request body
         */
        xFbapiSignature: string,
        /**
         * Sub-account identifier.
         */
        accountId: string,
        /**
         * Conversion pair to get the rate for.
         */
        conversionPairId?: string,
        /**
         * Ramps pair to get the rate for.
         */
        rampsPairId?: string,
        /**
         * Order book pair to get the rate for.
         */
        orderBookPairId?: string,
    }): CancelablePromise<Rate> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/accounts/{accountId}/rate',
            path: {
                'accountId': accountId,
            },
            headers: {
                'X-FBAPI-KEY': xFbapiKey,
                'X-FBAPI-NONCE': xFbapiNonce,
                'X-FBAPI-TIMESTAMP': xFbapiTimestamp,
                'X-FBAPI-SIGNATURE': xFbapiSignature,
            },
            query: {
                'conversionPairId': conversionPairId,
                'rampsPairId': rampsPairId,
                'orderBookPairId': orderBookPairId,
            },
            errors: {
                400: `Request could not be processed due to a client error.`,
                401: `Request is unauthorized`,
            },
        });
    }

}
