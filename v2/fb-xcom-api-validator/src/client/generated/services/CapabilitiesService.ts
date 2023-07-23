/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { AssetDefinition } from '../models/AssetDefinition';
import type { AssetReference } from '../models/AssetReference';
import type { Capabilities } from '../models/Capabilities';
import type { DepositCapability } from '../models/DepositCapability';
import type { GeneralError } from '../models/GeneralError';
import type { OrderBook } from '../models/OrderBook';
import type { QuoteCapabilities } from '../models/QuoteCapabilities';
import type { WithdrawalCapability } from '../models/WithdrawalCapability';

import type { CancelablePromise } from '../core/CancelablePromise';
import type { BaseHttpRequest } from '../core/BaseHttpRequest';

export class CapabilitiesService {

    constructor(public readonly httpRequest: BaseHttpRequest) {}

    /**
     * Describe server capabilities
     * Returns the API version and all the capabilities that the server supports.
     *
     * The capabilities are specified as a map. The map keys are the capability names and the values are lists of account IDs. If all the accounts support a capability, an asterisk could be used, instead of listing all the accounts.
     * @returns Capabilities Server capability details.
     * @returns GeneralError Failed to process request.
     * @throws ApiError
     */
    public getCapabilities({
        xFbapiKey,
        xFbapiNonce,
        xFbapiTimestamp,
        xFbapiSignature,
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
    }): CancelablePromise<Capabilities | GeneralError> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/capabilities',
            headers: {
                'X-FBAPI-KEY': xFbapiKey,
                'X-FBAPI-NONCE': xFbapiNonce,
                'X-FBAPI-TIMESTAMP': xFbapiTimestamp,
                'X-FBAPI-SIGNATURE': xFbapiSignature,
            },
            errors: {
                400: `Request could not be processed due to a client error.`,
                401: `Request is unauthorized`,
            },
        });
    }

    /**
     * Get list of supported additional assets
     * Returns assets, supported in addition to the predefined national currencies and the native cryptocurrencies.
     * @returns any List of additional assets.
     * @returns GeneralError Failed to process request.
     * @throws ApiError
     */
    public getAdditionalAssets({
        xFbapiKey,
        xFbapiNonce,
        xFbapiTimestamp,
        xFbapiSignature,
        limit = 10,
        startingAfter,
        endingBefore,
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
    }): CancelablePromise<{
        assets: Array<AssetDefinition>;
    } | GeneralError> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/capabilities/assets',
            headers: {
                'X-FBAPI-KEY': xFbapiKey,
                'X-FBAPI-NONCE': xFbapiNonce,
                'X-FBAPI-TIMESTAMP': xFbapiTimestamp,
                'X-FBAPI-SIGNATURE': xFbapiSignature,
            },
            query: {
                'limit': limit,
                'startingAfter': startingAfter,
                'endingBefore': endingBefore,
            },
            errors: {
                400: `Request could not be processed due to a client error.`,
                401: `Request is unauthorized`,
            },
        });
    }

    /**
     * Get details of a supported additional asset.
     * Returns the details of an assets, supported in addition to the predefined national currencies and the native cryptocurrencies.
     * @returns AssetDefinition List of additional assets.
     * @returns GeneralError Failed to process request.
     * @throws ApiError
     */
    public getAssetDetails({
        xFbapiKey,
        xFbapiNonce,
        xFbapiTimestamp,
        xFbapiSignature,
        id,
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
         * Entity unique identifier.
         */
        id: string,
    }): CancelablePromise<AssetDefinition | GeneralError> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/capabilities/assets/{id}',
            path: {
                'id': id,
            },
            headers: {
                'X-FBAPI-KEY': xFbapiKey,
                'X-FBAPI-NONCE': xFbapiNonce,
                'X-FBAPI-TIMESTAMP': xFbapiTimestamp,
                'X-FBAPI-SIGNATURE': xFbapiSignature,
            },
            errors: {
                400: `Request could not be processed due to a client error.`,
                401: `Request is unauthorized`,
            },
        });
    }

    /**
     * Get list of supported balance assets
     * @returns any List of balance assets
     * @returns GeneralError Failed to process request.
     * @throws ApiError
     */
    public getBalanceAssets({
        xFbapiKey,
        xFbapiNonce,
        xFbapiTimestamp,
        xFbapiSignature,
        limit = 10,
        startingAfter,
        endingBefore,
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
    }): CancelablePromise<{
        capabilities?: Array<AssetReference>;
    } | GeneralError> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/capabilities/balances',
            headers: {
                'X-FBAPI-KEY': xFbapiKey,
                'X-FBAPI-NONCE': xFbapiNonce,
                'X-FBAPI-TIMESTAMP': xFbapiTimestamp,
                'X-FBAPI-SIGNATURE': xFbapiSignature,
            },
            query: {
                'limit': limit,
                'startingAfter': startingAfter,
                'endingBefore': endingBefore,
            },
            errors: {
                400: `Request could not be processed due to a client error.`,
                401: `Request is unauthorized`,
            },
        });
    }

    /**
     * List possible asset conversions
     * @returns QuoteCapabilities List of possible asset conversions.
     * @returns GeneralError Failed to process request.
     * @throws ApiError
     */
    public getQuoteCapabilities({
        xFbapiKey,
        xFbapiNonce,
        xFbapiSignature,
        xFbapiTimestamp,
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
    }): CancelablePromise<QuoteCapabilities | GeneralError> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/capabilities/liquidity/quotes',
            headers: {
                'X-FBAPI-KEY': xFbapiKey,
                'X-FBAPI-NONCE': xFbapiNonce,
                'X-FBAPI-SIGNATURE': xFbapiSignature,
                'X-FBAPI-TIMESTAMP': xFbapiTimestamp,
            },
            errors: {
                400: `Request could not be processed due to a client error.`,
                401: `Request is unauthorized`,
            },
        });
    }

    /**
     * List order books
     * @returns any List of order books
     * @returns GeneralError Failed to process request.
     * @throws ApiError
     */
    public getBooks({
        xFbapiKey,
        xFbapiNonce,
        xFbapiSignature,
        xFbapiTimestamp,
        limit = 10,
        startingAfter,
        endingBefore,
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
    }): CancelablePromise<{
        books?: Array<OrderBook>;
    } | GeneralError> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/capabilities/trading/books',
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
            },
            errors: {
                400: `Request could not be processed due to a client error.`,
                401: `Request is unauthorized`,
            },
        });
    }

    /**
     * Get list of supported withdrawal methods
     * @returns any List of withdrawal methods for account.
     * @returns GeneralError Failed to process request.
     * @throws ApiError
     */
    public getWithdrawalMethods({
        xFbapiKey,
        xFbapiNonce,
        xFbapiSignature,
        xFbapiTimestamp,
        limit = 10,
        startingAfter,
        endingBefore,
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
    }): CancelablePromise<{
        capabilities?: Array<WithdrawalCapability>;
    } | GeneralError> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/capabilities/transfers/withdrawals',
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
            },
            errors: {
                400: `Request could not be processed due to a client error.`,
                401: `Request is unauthorized`,
            },
        });
    }

    /**
     * Get list of supported deposit methods
     * @returns any List of deposit methods for account.
     * @returns GeneralError Failed to process request.
     * @throws ApiError
     */
    public getDepositMethods({
        xFbapiKey,
        xFbapiNonce,
        xFbapiSignature,
        xFbapiTimestamp,
        limit = 10,
        startingAfter,
        endingBefore,
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
    }): CancelablePromise<{
        capabilities?: Array<DepositCapability>;
    } | GeneralError> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/capabilities/transfers/deposits',
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
            },
            errors: {
                400: `Request could not be processed due to a client error.`,
                401: `Request is unauthorized`,
            },
        });
    }

}
