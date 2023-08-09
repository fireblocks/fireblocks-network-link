/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CrossAccountWithdrawal } from '../models/CrossAccountWithdrawal';
import type { CrossAccountWithdrawalRequest } from '../models/CrossAccountWithdrawalRequest';

import type { CancelablePromise } from '../core/CancelablePromise';
import type { BaseHttpRequest } from '../core/BaseHttpRequest';

export class TransfersPeerAccountsService {

    constructor(public readonly httpRequest: BaseHttpRequest) {}

    /**
     * Get list of withdrawals to peer accounts, sorted by creation time
     * @returns any List of withdrawals.
     * @throws ApiError
     */
    public getPeerAccountWithdrawals({
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
        withdrawals: Array<CrossAccountWithdrawal>;
    }> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/accounts/{accountId}/transfers/withdrawals/peeraccount',
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
                401: `Request is unauthorized`,
            },
        });
    }

    /**
     * Create new withdrawal to a peer account
     * Should reject any non peer acount withdrawal request.
     * @returns CrossAccountWithdrawal New withdrawal has been successfully created.
     * @throws ApiError
     */
    public createPeerAccountWithdrawal({
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
        /**
         * Withdrawal details
         */
        requestBody: CrossAccountWithdrawalRequest,
    }): CancelablePromise<CrossAccountWithdrawal> {
        return this.httpRequest.request({
            method: 'POST',
            url: '/accounts/{accountId}/transfers/withdrawals/peeraccount',
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
                401: `Request is unauthorized`,
            },
        });
    }

}
