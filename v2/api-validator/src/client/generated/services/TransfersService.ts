/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Deposit } from '../models/Deposit';
import type { Withdrawal } from '../models/Withdrawal';

import type { CancelablePromise } from '../core/CancelablePromise';
import type { BaseHttpRequest } from '../core/BaseHttpRequest';

export class TransfersService {

    constructor(public readonly httpRequest: BaseHttpRequest) {}

    /**
     * Get list of withdrawals sorted by creation time
     * Retrieves a paginated list of all withdrawal transactions for the specified account. Withdrawals are sorted by creation time and include all types of withdrawal operations.
 * 
     * @returns any List of withdrawals.
     * @throws ApiError
     */
    public getWithdrawals({
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
 * Object ID. Instructs to return the items immediately following this object and not including it. Cannot be used together with `endingBefore`.
 */
startingAfter?: string,
/**
 * Object ID. Instructs to return the items immediately preceding this object and not including it. Cannot be used together with `startingAfter`.
 */
endingBefore?: string,
/**
 * Controls the order of the items in the returned list.
 */
order?: 'asc' | 'desc',
}): CancelablePromise<{
withdrawals: Array<Withdrawal>;
}> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/accounts/{accountId}/transfers/withdrawals',
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
     * Get withdrawal details
     * Retrieves detailed information about a specific withdrawal transaction, including status, amounts, fees, destination details, and processing information.
 * 
     * @returns Withdrawal Withdrawals details.
     * @throws ApiError
     */
    public getWithdrawalDetails({
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
}): CancelablePromise<Withdrawal> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/accounts/{accountId}/transfers/withdrawals/{id}',
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
                401: `Request is unauthorized`,
            },
        });
    }

    /**
     * Get list of deposits sorted by creation time in a descending order
     * Retrieves a paginated list of all deposit transactions for the specified account. Deposits are sorted by creation time in descending order and include all types of deposit operations.
 * 
     * @returns any Deposits details.
     * @throws ApiError
     */
    public getDeposits({
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
 * Object ID. Instructs to return the items immediately following this object and not including it. Cannot be used together with `endingBefore`.
 */
startingAfter?: string,
/**
 * Object ID. Instructs to return the items immediately preceding this object and not including it. Cannot be used together with `startingAfter`.
 */
endingBefore?: string,
}): CancelablePromise<{
deposits: Array<Deposit>;
}> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/accounts/{accountId}/transfers/deposits',
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
                401: `Request is unauthorized`,
            },
        });
    }

    /**
     * Get deposit details
     * Retrieves detailed information about a specific deposit transaction, including status, amounts, source details, confirmation information, and processing details.
 * 
     * @returns Deposit List of deposits.
     * @throws ApiError
     */
    public getDepositDetails({
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
}): CancelablePromise<Deposit> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/accounts/{accountId}/transfers/deposits/{id}',
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
                401: `Request is unauthorized`,
            },
        });
    }

}
