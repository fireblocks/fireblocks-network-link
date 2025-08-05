/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { AccountRate } from '../models/AccountRate';
import type { AssetCode } from '../models/AssetCode';

import type { CancelablePromise } from '../core/CancelablePromise';
import type { BaseHttpRequest } from '../core/BaseHttpRequest';

export class RatesService {

    constructor(public readonly httpRequest: BaseHttpRequest) {}

    /**
     * Get account rate
     * Returns the rate of the account for the given base and quote assets. The rate is the amount of quote asset that is required to buy 1 unit of the base asset. The rate is expressed in the quote asset decimal places.
     * @returns AccountRate Account rate.
     * @throws ApiError
     */
    public getAccountRate({
        xFbapiKey,
        xFbapiNonce,
        xFbapiTimestamp,
        xFbapiSignature,
        accountId,
        baseAsset,
        quoteAsset,
        testAsset,
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
         * Limits the response to one asset with the provided BaseAsset Cannot be used in conjunction with nationalCurrencyCode or assetId
         */
        baseAsset: AssetCode,
        /**
         * Limits the response to one asset with the provided QuoteAsset Cannot be used in conjunction with nationalCurrencyCode or assetId
         */
        quoteAsset: AssetCode,
        /**
         * Flag to include the testnet assets in the response.
         */
        testAsset?: boolean,
    }): CancelablePromise<AccountRate> {
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
                'baseAsset': baseAsset,
                'quoteAsset': quoteAsset,
                'testAsset': testAsset,
            },
            errors: {
                400: `Request could not be processed due to a client error.`,
                401: `Request is unauthorized`,
            },
        });
    }

}
