/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Balances } from '../models/Balances';
import type { CryptocurrencySymbol } from '../models/CryptocurrencySymbol';
import type { NationalCurrencyCode } from '../models/NationalCurrencyCode';

import type { CancelablePromise } from '../core/CancelablePromise';
import type { BaseHttpRequest } from '../core/BaseHttpRequest';

export class HistoricBalancesService {

    constructor(public readonly httpRequest: BaseHttpRequest) {}

    /**
     * Get balances at specific time in the past
     * Retrieves historical balance information for the specified account at a specific point in time. Useful for reconciliation and auditing purposes to see account states at historical moments.
     *
     * @returns any List of asset balances.
     * @throws ApiError
     */
    public getHistoricBalances({
        xFbapiKey,
        xFbapiNonce,
        xFbapiTimestamp,
        xFbapiSignature,
        accountId,
        time,
        limit = 10,
        startingAfter,
        endingBefore,
        assetId,
        nationalCurrencyCode,
        cryptocurrencySymbol,
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
         * Time of the requested balances.
         */
        time: string,
        /**
         * Maximum number of returned items.
         */
        limit?: number,
        /**
         * Object ID. Instructs to return the items immediately following this object and not including it. Cannot be used together with `endingBefore`.
         */
        startingAfter?: string,
        /**
         * Object ID. Instructs to return the items immediately preceding this object and not including it. Cannot be used together with `startingAfter`.
         */
        endingBefore?: string,
        /**
         * ID of one of the assets returned in get-additional-assets. Limits the response to one. Cannot be used in conjunction with cryptocurrencySymbol or nationalCurrencyCode
         */
        assetId?: string,
        /**
         * Limits the response to one asset with the provided NationalCurrencyCode Cannot be used in conjunction with cryptocurrencySymbol or assetId
         */
        nationalCurrencyCode?: NationalCurrencyCode,
        /**
         * Limits the response to one asset with the provided CryptocurrencySymbol Cannot be used in conjunction with nationalCurrencyCode or assetId
         */
        cryptocurrencySymbol?: CryptocurrencySymbol,
    }): CancelablePromise<{
        balances: Balances;
    }> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/accounts/{accountId}/historic-balances',
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
                'limit': limit,
                'startingAfter': startingAfter,
                'endingBefore': endingBefore,
                'assetId': assetId,
                'nationalCurrencyCode': nationalCurrencyCode,
                'cryptocurrencySymbol': cryptocurrencySymbol,
                'time': time,
            },
            errors: {
                400: `Request could not be processed due to a client error.`,
                401: `Request is unauthorized`,
            },
        });
    }

}
