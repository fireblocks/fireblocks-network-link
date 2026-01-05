/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { DepositAddress } from '../models/DepositAddress';
import type { DepositAddressCreationRequest } from '../models/DepositAddressCreationRequest';
import type { FiatWithdrawal } from '../models/FiatWithdrawal';
import type { FiatWithdrawalRequest } from '../models/FiatWithdrawalRequest';

import type { CancelablePromise } from '../core/CancelablePromise';
import type { BaseHttpRequest } from '../core/BaseHttpRequest';

export class TransfersFiatService {

    constructor(public readonly httpRequest: BaseHttpRequest) {}

    /**
     * Get list of fiat withdrawals sorted by creation time
     * Retrieves a paginated list of fiat currency withdrawal transactions. Includes traditional banking transfers and wire transfers, sorted by creation time.
 * 
     * @returns any List of withdrawals.
     * @throws ApiError
     */
    public getFiatWithdrawals({
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
withdrawals: Array<FiatWithdrawal>;
}> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/accounts/{accountId}/transfers/withdrawals/fiat',
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
     * Create new fiat withdrawal
     * Should reject any non fiat withdrawal request.
     * @returns FiatWithdrawal New withdrawal has been successfully created.
     * @throws ApiError
     */
    public createFiatWithdrawal({
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
requestBody: FiatWithdrawalRequest,
}): CancelablePromise<FiatWithdrawal> {
        return this.httpRequest.request({
            method: 'POST',
            url: '/accounts/{accountId}/transfers/withdrawals/fiat',
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

    /**
     * Create new deposit address
     * Creates a new deposit address for the specified account and asset. The generated address can be used to receive deposits for the specified cryptocurrency or token.
 * 
     * @returns DepositAddress New deposit address created.
     * @throws ApiError
     */
    public createDepositAddress({
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
 * Deposit address details
 */
requestBody: DepositAddressCreationRequest,
}): CancelablePromise<DepositAddress> {
        return this.httpRequest.request({
            method: 'POST',
            url: '/accounts/{accountId}/transfers/deposits/addresses',
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

    /**
     * Get list of existing deposit addresses
     * Retrieves a paginated list of all deposit addresses associated with the specified account. Shows addresses for different cryptocurrencies and networks that can receive deposits.
 * 
     * @returns any List of existing deposit addresses.
     * @throws ApiError
     */
    public getDepositAddresses({
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
addresses: Array<DepositAddress>;
}> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/accounts/{accountId}/transfers/deposits/addresses',
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
     * Get details of a deposit address
     * Retrieves detailed information about a specific deposit address, including the address string, associated network, asset type, and usage metadata.
 * 
     * @returns DepositAddress New deposit address created.
     * @throws ApiError
     */
    public getDepositAddressDetails({
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
}): CancelablePromise<DepositAddress> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/accounts/{accountId}/transfers/deposits/addresses/{id}',
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
     * Disable a deposit address
     * Disables a specific deposit address, preventing it from receiving new deposits. Existing funds sent to the address may still be processed depending on timing and confirmation status.
 * 
     * @returns any Deposit address disabled.
     * @throws ApiError
     */
    public disableDepositAddress({
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
}): CancelablePromise<any> {
        return this.httpRequest.request({
            method: 'DELETE',
            url: '/accounts/{accountId}/transfers/deposits/addresses/{id}',
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
