/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { GeneralError } from '../models/GeneralError';
import type { Quote } from '../models/Quote';
import type { QuoteRequest } from '../models/QuoteRequest';

import type { CancelablePromise } from '../core/CancelablePromise';
import type { BaseHttpRequest } from '../core/BaseHttpRequest';

export class LiquidityService {

    constructor(public readonly httpRequest: BaseHttpRequest) {}

    /**
     * Quote creation request
     * Either `fromAmount` or `toAmount` must be specified, while the unspecified amount will be populated by the server and returned in the response.
     * @returns Quote Quote details.
     * @returns GeneralError Failed to process request.
     * @throws ApiError
     */
    public createQuote({
        xFbapiKey,
        xFbapiNonce,
        xFbapiSignature,
        xFbapiTimestamp,
        accountId,
        requestBody,
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
         * Request signature using the chosen cryptographic algorithm. The signature is to be calculated on concatenation of the following request fields in the specified order:
         * - `X-FBAPI-TIMESTAMP` - `X-FBAPI-NONCE` - HTTP request method in upper case - Endpoint path, including the query parameters - Request body
         */
        xFbapiSignature: string,
        /**
         * Request timestamp in milliseconds since Unix epoch.
         */
        xFbapiTimestamp: number,
        /**
         * Sub-account identifier.
         */
        accountId: string,
        requestBody?: QuoteRequest,
    }): CancelablePromise<Quote | GeneralError> {
        return this.httpRequest.request({
            method: 'POST',
            url: '/accounts/{accountId}/liquidity/quotes',
            path: {
                'accountId': accountId,
            },
            headers: {
                'X-FBAPI-KEY': xFbapiKey,
                'X-FBAPI-NONCE': xFbapiNonce,
                'X-FBAPI-SIGNATURE': xFbapiSignature,
                'X-FBAPI-TIMESTAMP': xFbapiTimestamp,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `Request could not be processed due to a client error.`,
            },
        });
    }

    /**
     * Get list of quotes sorted by creation time
     * @returns any Quotes details.
     * @returns GeneralError Failed to process request.
     * @throws ApiError
     */
    public getQuotes({
        xFbapiKey,
        xFbapiNonce,
        xFbapiSignature,
        xFbapiTimestamp,
        accountId,
        limit = 10,
        startingAfter,
        endingBefore,
        order = 'desc',
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
         * Request signature using the chosen cryptographic algorithm. The signature is to be calculated on concatenation of the following request fields in the specified order:
         * - `X-FBAPI-TIMESTAMP` - `X-FBAPI-NONCE` - HTTP request method in upper case - Endpoint path, including the query parameters - Request body
         */
        xFbapiSignature: string,
        /**
         * Request timestamp in milliseconds since Unix epoch.
         */
        xFbapiTimestamp: number,
        /**
         * Sub-account identifier.
         */
        accountId: string,
        /**
         * Maximum number of returned items.
         */
        limit?: number,
        /**
         * Object ID. Instructs to return the items immediately following this object. Cannot be used together with `endingBefore`.
         */
        startingAfter?: string,
        /**
         * Object ID. Instructs to return the items immediately preceding this object. Cannot be used together with `startingAfter`.
         */
        endingBefore?: string,
        /**
         * Controls the order of the items in the returned list.
         */
        order?: 'asc' | 'desc',
    }): CancelablePromise<{
        withdrawals?: Array<Quote>;
    } | GeneralError> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/accounts/{accountId}/liquidity/quotes',
            path: {
                'accountId': accountId,
            },
            headers: {
                'X-FBAPI-KEY': xFbapiKey,
                'X-FBAPI-NONCE': xFbapiNonce,
                'X-FBAPI-SIGNATURE': xFbapiSignature,
                'X-FBAPI-TIMESTAMP': xFbapiTimestamp,
            },
            query: {
                'limit': limit,
                'startingAfter': startingAfter,
                'endingBefore': endingBefore,
                'order': order,
            },
            errors: {
                400: `Request could not be processed due to a client error.`,
            },
        });
    }

    /**
     * Get quote details
     * @returns Quote Quote details.
     * @returns GeneralError Failed to process request.
     * @throws ApiError
     */
    public getQuoteDetails({
        xFbapiKey,
        xFbapiNonce,
        xFbapiSignature,
        xFbapiTimestamp,
        id,
        accountId,
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
         * Request signature using the chosen cryptographic algorithm. The signature is to be calculated on concatenation of the following request fields in the specified order:
         * - `X-FBAPI-TIMESTAMP` - `X-FBAPI-NONCE` - HTTP request method in upper case - Endpoint path, including the query parameters - Request body
         */
        xFbapiSignature: string,
        /**
         * Request timestamp in milliseconds since Unix epoch.
         */
        xFbapiTimestamp: number,
        /**
         * Entity unique identifier.
         */
        id: string,
        /**
         * Sub-account identifier.
         */
        accountId: string,
    }): CancelablePromise<Quote | GeneralError> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/accounts/{accountId}/liquidity/quotes/{id}',
            path: {
                'id': id,
                'accountId': accountId,
            },
            headers: {
                'X-FBAPI-KEY': xFbapiKey,
                'X-FBAPI-NONCE': xFbapiNonce,
                'X-FBAPI-SIGNATURE': xFbapiSignature,
                'X-FBAPI-TIMESTAMP': xFbapiTimestamp,
            },
            errors: {
                400: `Request could not be processed due to a client error.`,
            },
        });
    }

    /**
     * Execute quote
     * @returns Quote Quote details.
     * @returns GeneralError Failed to process request.
     * @throws ApiError
     */
    public executeQuote({
        xFbapiKey,
        xFbapiNonce,
        xFbapiSignature,
        xFbapiTimestamp,
        id,
        accountId,
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
         * Request signature using the chosen cryptographic algorithm. The signature is to be calculated on concatenation of the following request fields in the specified order:
         * - `X-FBAPI-TIMESTAMP` - `X-FBAPI-NONCE` - HTTP request method in upper case - Endpoint path, including the query parameters - Request body
         */
        xFbapiSignature: string,
        /**
         * Request timestamp in milliseconds since Unix epoch.
         */
        xFbapiTimestamp: number,
        /**
         * Entity unique identifier.
         */
        id: string,
        /**
         * Sub-account identifier.
         */
        accountId: string,
    }): CancelablePromise<Quote | GeneralError> {
        return this.httpRequest.request({
            method: 'POST',
            url: '/accounts/{accountId}/liquidity/quotes/{id}/execute',
            path: {
                'id': id,
                'accountId': accountId,
            },
            headers: {
                'X-FBAPI-KEY': xFbapiKey,
                'X-FBAPI-NONCE': xFbapiNonce,
                'X-FBAPI-SIGNATURE': xFbapiSignature,
                'X-FBAPI-TIMESTAMP': xFbapiTimestamp,
            },
            errors: {
                400: `Request could not be processed due to a client error.`,
            },
        });
    }

}
