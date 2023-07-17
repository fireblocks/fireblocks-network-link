/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { GeneralError } from '../models/GeneralError';
import type { MarketEntry } from '../models/MarketEntry';
import type { MarketTrade } from '../models/MarketTrade';
import type { Order } from '../models/Order';
import type { OrderBook } from '../models/OrderBook';
import type { OrderRequest } from '../models/OrderRequest';

import type { CancelablePromise } from '../core/CancelablePromise';
import type { BaseHttpRequest } from '../core/BaseHttpRequest';

export class TradingService {

    constructor(public readonly httpRequest: BaseHttpRequest) {}

    /**
     * Get details of an order book
     * @returns OrderBook The specified trading book if it exists
     * @returns GeneralError Failed to process request.
     * @throws ApiError
     */
    public getBookDetails({
        xFbapiKey,
        xFbapiNonce,
        xFbapiSignature,
        xFbapiTimestamp,
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
    }): CancelablePromise<OrderBook | GeneralError> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/trading/books/{id}',
            path: {
                'id': id,
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
     * Get active sell orders in an order book
     * List active sell orders in an order book, sorted ascending by the sell price.
     * @returns any Active sell orders.
     * @returns GeneralError Failed to process request.
     * @throws ApiError
     */
    public getBookAsks({
        xFbapiKey,
        xFbapiNonce,
        xFbapiSignature,
        xFbapiTimestamp,
        id,
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
         * Entity unique identifier.
         */
        id: string,
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
        asks: Array<MarketEntry>;
    } | GeneralError> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/trading/books/{id}/asks',
            path: {
                'id': id,
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
            },
            errors: {
                400: `Request could not be processed due to a client error.`,
            },
        });
    }

    /**
     * Get active buy orders in an order book
     * List active buy orders in an order book, sorted descending by the buy price.
     * @returns any Active buy orders.
     * @returns GeneralError Failed to process request.
     * @throws ApiError
     */
    public getBookBids({
        xFbapiKey,
        xFbapiNonce,
        xFbapiSignature,
        xFbapiTimestamp,
        id,
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
         * Entity unique identifier.
         */
        id: string,
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
        bids: Array<MarketEntry>;
    } | GeneralError> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/trading/books/{id}/bids',
            path: {
                'id': id,
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
            },
            errors: {
                400: `Request could not be processed due to a client error.`,
            },
        });
    }

    /**
     * List fulfilled orders in an order book
     * List fulfilled orders in an order book, sorted descending by the fulfillment time.
     * @returns any List of fulfilled trades.
     * @returns GeneralError Failed to process request.
     * @throws ApiError
     */
    public getBookOrderHistory({
        xFbapiKey,
        xFbapiNonce,
        xFbapiSignature,
        xFbapiTimestamp,
        id,
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
         * Entity unique identifier.
         */
        id: string,
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
        trades: Array<MarketTrade>;
    } | GeneralError> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/trading/books/{id}/history',
            path: {
                'id': id,
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
            },
            errors: {
                400: `Request could not be processed due to a client error.`,
            },
        });
    }

    /**
     * List trading orders
     * List trading orders sorted descending by the creation time.
     * @returns any Order details
     * @returns GeneralError Failed to process request.
     * @throws ApiError
     */
    public getOrders({
        xFbapiKey,
        xFbapiNonce,
        xFbapiSignature,
        xFbapiTimestamp,
        accountId,
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
    }): CancelablePromise<{
        orders: Array<Order>;
    } | GeneralError> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/accounts/{accountId}/trading/orders',
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
            },
            errors: {
                400: `Request could not be processed due to a client error.`,
            },
        });
    }

    /**
     * Create a new trading order
     * @returns Order Newly created book order details
     * @returns GeneralError Failed to process request.
     * @throws ApiError
     */
    public createOrder({
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
        requestBody?: OrderRequest,
    }): CancelablePromise<Order | GeneralError> {
        return this.httpRequest.request({
            method: 'POST',
            url: '/accounts/{accountId}/trading/orders',
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
     * Get trading order details
     * @returns Order Book order details
     * @returns GeneralError Failed to process request.
     * @throws ApiError
     */
    public getOrderDetails({
        xFbapiKey,
        xFbapiNonce,
        xFbapiSignature,
        xFbapiTimestamp,
        accountId,
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
         * Entity unique identifier.
         */
        id: string,
    }): CancelablePromise<Order | GeneralError> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/accounts/{accountId}/trading/orders/{id}',
            path: {
                'accountId': accountId,
                'id': id,
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
     * Cancel an active trading order
     * @returns any Order canceled.
     * @returns GeneralError Failed to process request.
     * @throws ApiError
     */
    public cancelOrder({
        xFbapiKey,
        xFbapiNonce,
        xFbapiSignature,
        xFbapiTimestamp,
        accountId,
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
         * Entity unique identifier.
         */
        id: string,
    }): CancelablePromise<any | GeneralError> {
        return this.httpRequest.request({
            method: 'DELETE',
            url: '/accounts/{accountId}/trading/orders/{id}',
            path: {
                'accountId': accountId,
                'id': id,
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