/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Account } from '../models/Account';

import type { CancelablePromise } from '../core/CancelablePromise';
import type { BaseHttpRequest } from '../core/BaseHttpRequest';

export class AccountsService {

    constructor(public readonly httpRequest: BaseHttpRequest) {}

    /**
     * Get list of sub-accounts
     * Retrieves a paginated list of all sub-accounts available to the provider. Can optionally include balance information for each account if requested. Allows defining parent-child relationships between accounts. Notice that Fireblocks currently supports only one level of hierarchy.
     * @returns any List of sub-accounts.
     * @throws ApiError
     */
    public getAccounts({
        xFbapiKey,
        xFbapiNonce,
        xFbapiTimestamp,
        xFbapiSignature,
        limit = 10,
        startingAfter,
        endingBefore,
        balances,
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
         * Object ID. Instructs to return the items immediately following this object and not including it. Cannot be used together with `endingBefore`.
         */
        startingAfter?: string,
        /**
         * Object ID. Instructs to return the items immediately preceding this object and not including it. Cannot be used together with `startingAfter`.
         */
        endingBefore?: string,
        /**
         * Flag to include the account balances in the response. Balances are not returned by default for account endpoints.
         */
        balances?: boolean,
    }): CancelablePromise<{
        accounts: Array<Account>;
    }> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/accounts',
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
                'balances': balances,
            },
            errors: {
                400: `Request could not be processed due to a client error.`,
                401: `Request is unauthorized`,
            },
        });
    }

    /**
     * Get sub-account details
     * Retrieves detailed information about a specific sub-account, including account metadata and optionally balance information if requested.
     *
     * @returns Account List of sub-accounts.
     * @throws ApiError
     */
    public getAccountDetails({
        xFbapiKey,
        xFbapiNonce,
        xFbapiTimestamp,
        xFbapiSignature,
        accountId,
        balances,
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
         * Flag to include the account balances in the response. Balances are not returned by default for account endpoints.
         */
        balances?: boolean,
    }): CancelablePromise<Account> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/accounts/{accountId}',
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
                'balances': balances,
            },
            errors: {
                400: `Request could not be processed due to a client error.`,
                401: `Request is unauthorized`,
            },
        });
    }

}
