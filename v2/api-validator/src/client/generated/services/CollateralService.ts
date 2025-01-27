/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CollateralAccount } from '../models/CollateralAccount';
import type { CollateralAccountLink } from '../models/CollateralAccountLink';
import type { CollateralAddress } from '../models/CollateralAddress';
import type { CollateralAssetAddress } from '../models/CollateralAssetAddress';
import type { CollateralDepositAddresses } from '../models/CollateralDepositAddresses';
import type { CollateralDepositTransactionIntentRequest } from '../models/CollateralDepositTransactionIntentRequest';
import type { CollateralDepositTransactionIntentResponse } from '../models/CollateralDepositTransactionIntentResponse';
import type { CollateralDepositTransactionRequest } from '../models/CollateralDepositTransactionRequest';
import type { CollateralDepositTransactionResponse } from '../models/CollateralDepositTransactionResponse';
import type { CollateralDepositTransactionsResponse } from '../models/CollateralDepositTransactionsResponse';
import type { CollateralWithdrawalTransaction } from '../models/CollateralWithdrawalTransaction';
import type { CollateralWithdrawalTransactionIntentRequest } from '../models/CollateralWithdrawalTransactionIntentRequest';
import type { CollateralWithdrawalTransactionIntentResponse } from '../models/CollateralWithdrawalTransactionIntentResponse';
import type { CollateralWithdrawalTransactionRequest } from '../models/CollateralWithdrawalTransactionRequest';
import type { CollateralWithdrawalTransactions } from '../models/CollateralWithdrawalTransactions';
import type { CryptocurrencySymbol } from '../models/CryptocurrencySymbol';
import type { SettlementInstructions } from '../models/SettlementInstructions';
import type { SettlementRequest } from '../models/SettlementRequest';
import type { SettlementState } from '../models/SettlementState';

import type { CancelablePromise } from '../core/CancelablePromise';
import type { BaseHttpRequest } from '../core/BaseHttpRequest';

export class CollateralService {

    constructor(public readonly httpRequest: BaseHttpRequest) {}

    /**
     * Initiate collateral account link
     * Creates a new link between a collateral account and a provider account.
     *
     * @returns CollateralAccountLink Link created successfully
     * @throws ApiError
     */
    public createCollateralAccountLink({
        xFbPlatformSignature,
        xFbapiKey,
        xFbapiNonce,
        xFbapiSignature,
        xFbapiTimestamp,
        accountId,
        requestBody,
    }: {
        /**
         * Authentication signature of Fireblocks as the originator of the request
         */
        xFbPlatformSignature: string,
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
         * Collateral account link details
         */
        requestBody: CollateralAccount,
    }): CancelablePromise<CollateralAccountLink> {
        return this.httpRequest.request({
            method: 'POST',
            url: '/accounts/{accountId}/collateral/link',
            path: {
                'accountId': accountId,
            },
            headers: {
                'X-FB-PLATFORM-SIGNATURE': xFbPlatformSignature,
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
     * Get list of collateral account links
     * @returns any List of collateral account links
     * @throws ApiError
     */
    public getCollateralAccountLinks({
        xFbPlatformSignature,
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
         * Authentication signature of Fireblocks as the originator of the request
         */
        xFbPlatformSignature: string,
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
        collateralLinks: Array<CollateralAccountLink>;
    }> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/accounts/{accountId}/collateral/link',
            path: {
                'accountId': accountId,
            },
            headers: {
                'X-FB-PLATFORM-SIGNATURE': xFbPlatformSignature,
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
     * Create/register a collateral deposit address for a specific asset
     * Notifies the provider to have a new collateral deposit address for a specific asset. The provider is expected to listen to this address and credit the account accordingly,  or sending the funds to this address if a withdrawal is requested.
     *
     * @returns CollateralAssetAddress Successful Operation
     * @throws ApiError
     */
    public createCollateralDepositAddressForAsset({
        xFbPlatformSignature,
        xFbapiKey,
        xFbapiNonce,
        xFbapiSignature,
        xFbapiTimestamp,
        accountId,
        collateralId,
        requestBody,
    }: {
        /**
         * Authentication signature of Fireblocks as the originator of the request
         */
        xFbPlatformSignature: string,
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
         * ID of a collateral account
         */
        collateralId: string,
        /**
         * Collateral deposit address details
         */
        requestBody: CollateralAddress,
    }): CancelablePromise<CollateralAssetAddress> {
        return this.httpRequest.request({
            method: 'POST',
            url: '/accounts/{accountId}/collateral/{collateralId}/addresses',
            path: {
                'accountId': accountId,
                'collateralId': collateralId,
            },
            headers: {
                'X-FB-PLATFORM-SIGNATURE': xFbPlatformSignature,
                'X-FBAPI-KEY': xFbapiKey,
                'X-FBAPI-NONCE': xFbapiNonce,
                'X-FBAPI-SIGNATURE': xFbapiSignature,
                'X-FBAPI-TIMESTAMP': xFbapiTimestamp,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `Return Bad Request.`,
                401: `Unauthorized. Either API details are missing or invalid`,
                403: `Forbidden- You do not have access to the requested resource.`,
                415: `Unsupported media type. You need to use application/json.`,
                500: `Exchange internal error.`,
            },
        });
    }

    /**
     * Get list of collateral account deposit addresses
     * @returns CollateralDepositAddresses List of collateral deposit addresses
     * @throws ApiError
     */
    public getCollateralDepositAddresses({
        xFbPlatformSignature,
        xFbapiKey,
        xFbapiNonce,
        xFbapiSignature,
        xFbapiTimestamp,
        accountId,
        collateralId,
        limit = 10,
        startingAfter,
        endingBefore,
        assetId,
        cryptocurrencySymbol,
    }: {
        /**
         * Authentication signature of Fireblocks as the originator of the request
         */
        xFbPlatformSignature: string,
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
         * ID of a collateral account
         */
        collateralId: string,
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
         * Limits the response to one asset with the provided CryptocurrencySymbol Cannot be used in conjunction with nationalCurrencyCode or assetId
         */
        cryptocurrencySymbol?: CryptocurrencySymbol,
    }): CancelablePromise<CollateralDepositAddresses> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/accounts/{accountId}/collateral/{collateralId}/addresses',
            path: {
                'accountId': accountId,
                'collateralId': collateralId,
            },
            headers: {
                'X-FB-PLATFORM-SIGNATURE': xFbPlatformSignature,
                'X-FBAPI-KEY': xFbapiKey,
                'X-FBAPI-NONCE': xFbapiNonce,
                'X-FBAPI-SIGNATURE': xFbapiSignature,
                'X-FBAPI-TIMESTAMP': xFbapiTimestamp,
            },
            query: {
                'limit': limit,
                'startingAfter': startingAfter,
                'endingBefore': endingBefore,
                'assetId': assetId,
                'cryptocurrencySymbol': cryptocurrencySymbol,
            },
            errors: {
                400: `Request could not be processed due to a client error.`,
                401: `Request is unauthorized`,
            },
        });
    }

    /**
     * Get details of a specific deposit address in a collateral account.
     * @returns CollateralAssetAddress Specific collateral deposit address
     * @throws ApiError
     */
    public getCollateralDepositAddressesDetails({
        xFbPlatformSignature,
        xFbapiKey,
        xFbapiNonce,
        xFbapiSignature,
        xFbapiTimestamp,
        accountId,
        collateralId,
        id,
    }: {
        /**
         * Authentication signature of Fireblocks as the originator of the request
         */
        xFbPlatformSignature: string,
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
         * ID of a collateral account
         */
        collateralId: string,
        /**
         * Entity unique identifier.
         */
        id: string,
    }): CancelablePromise<CollateralAssetAddress> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/accounts/{accountId}/collateral/{collateralId}/addresses/{id}',
            path: {
                'accountId': accountId,
                'collateralId': collateralId,
                'id': id,
            },
            headers: {
                'X-FB-PLATFORM-SIGNATURE': xFbPlatformSignature,
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
     * Initiate a collateral deposit transaction intent request
     * Initiates a request for a new collateral deposit transaction. The provider is notified, and Fireblocks waits for their approval before proceeding.
     *
     * @returns CollateralDepositTransactionIntentResponse Successful Operation
     * @throws ApiError
     */
    public initiateCollateralDepositTransactionIntent({
        xFbPlatformSignature,
        xFbapiKey,
        xFbapiNonce,
        xFbapiSignature,
        xFbapiTimestamp,
        accountId,
        collateralId,
        requestBody,
    }: {
        /**
         * Authentication signature of Fireblocks as the originator of the request
         */
        xFbPlatformSignature: string,
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
         * ID of a collateral account
         */
        collateralId: string,
        /**
         * Collateral deposit transaction intent rewuest details
         */
        requestBody: CollateralDepositTransactionIntentRequest,
    }): CancelablePromise<CollateralDepositTransactionIntentResponse> {
        return this.httpRequest.request({
            method: 'POST',
            url: '/accounts/{accountId}/collateral/{collateralId}/intents/deposits',
            path: {
                'accountId': accountId,
                'collateralId': collateralId,
            },
            headers: {
                'X-FB-PLATFORM-SIGNATURE': xFbPlatformSignature,
                'X-FBAPI-KEY': xFbapiKey,
                'X-FBAPI-NONCE': xFbapiNonce,
                'X-FBAPI-SIGNATURE': xFbapiSignature,
                'X-FBAPI-TIMESTAMP': xFbapiTimestamp,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `Return Bad Request.`,
                401: `Unauthorized. Either API details are missing or invalid`,
                403: `Forbidden- You do not have access to the requested resource.`,
                415: `Unsupported media type. You need to use application/json.`,
                500: `Exchange internal error.`,
            },
        });
    }

    /**
     * Register a collateral deposit transaction
     * Notifies the provider to have start listening to a new collateral deposit transaction. The provider is expected to listen to this address and credit the account accordingly
     *
     * @returns CollateralDepositTransactionResponse Successful Operation
     * @throws ApiError
     */
    public registerCollateralDepositTransaction({
        xFbPlatformSignature,
        xFbapiKey,
        xFbapiNonce,
        xFbapiSignature,
        xFbapiTimestamp,
        accountId,
        collateralId,
        requestBody,
    }: {
        /**
         * Authentication signature of Fireblocks as the originator of the request
         */
        xFbPlatformSignature: string,
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
         * ID of a collateral account
         */
        collateralId: string,
        /**
         * Collateral deposit transaction details
         */
        requestBody: CollateralDepositTransactionRequest,
    }): CancelablePromise<CollateralDepositTransactionResponse> {
        return this.httpRequest.request({
            method: 'POST',
            url: '/accounts/{accountId}/collateral/{collateralId}/deposits',
            path: {
                'accountId': accountId,
                'collateralId': collateralId,
            },
            headers: {
                'X-FB-PLATFORM-SIGNATURE': xFbPlatformSignature,
                'X-FBAPI-KEY': xFbapiKey,
                'X-FBAPI-NONCE': xFbapiNonce,
                'X-FBAPI-SIGNATURE': xFbapiSignature,
                'X-FBAPI-TIMESTAMP': xFbapiTimestamp,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `Return Bad Request.`,
                401: `Unauthorized. Either API details are missing or invalid`,
                403: `Forbidden- You do not have access to the requested resource.`,
                415: `Unsupported media type. You need to use application/json.`,
                500: `Exchange internal error.`,
            },
        });
    }

    /**
     * Get list of collateral account deposit transactions sorted by creation time
     * @returns CollateralDepositTransactionsResponse List of collateral deposit transactions
     * @throws ApiError
     */
    public getCollateralDepositTransactions({
        xFbPlatformSignature,
        xFbapiKey,
        xFbapiNonce,
        xFbapiSignature,
        xFbapiTimestamp,
        accountId,
        collateralId,
        limit = 10,
        startingAfter,
        endingBefore,
    }: {
        /**
         * Authentication signature of Fireblocks as the originator of the request
         */
        xFbPlatformSignature: string,
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
         * ID of a collateral account
         */
        collateralId: string,
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
    }): CancelablePromise<CollateralDepositTransactionsResponse> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/accounts/{accountId}/collateral/{collateralId}/deposits',
            path: {
                'accountId': accountId,
                'collateralId': collateralId,
            },
            headers: {
                'X-FB-PLATFORM-SIGNATURE': xFbPlatformSignature,
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
     * Get a collateral account deposit transaction details
     * @returns CollateralDepositTransactionResponse A collateral deposit transaction details
     * @throws ApiError
     */
    public getCollateralDepositTransactionDetails({
        xFbPlatformSignature,
        xFbapiKey,
        xFbapiNonce,
        xFbapiSignature,
        xFbapiTimestamp,
        accountId,
        collateralId,
        collateralTxId,
    }: {
        /**
         * Authentication signature of Fireblocks as the originator of the request
         */
        xFbPlatformSignature: string,
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
         * ID of a collateral account
         */
        collateralId: string,
        /**
         * A Fireblocks' ID of a collateral transaction
         */
        collateralTxId: string,
    }): CancelablePromise<CollateralDepositTransactionResponse> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/accounts/{accountId}/collateral/{collateralId}/deposits/{collateralTxId}',
            path: {
                'accountId': accountId,
                'collateralId': collateralId,
                'collateralTxId': collateralTxId,
            },
            headers: {
                'X-FB-PLATFORM-SIGNATURE': xFbPlatformSignature,
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
     * Initiates a withdrawal transaction intent request for a collateral account
     * Initiates a request for a new collateral deposit transaction. The provider is notified, and Fireblocks waits for their approval before proceeding.
     *
     * @returns CollateralWithdrawalTransactionIntentResponse Successful Operation
     * @throws ApiError
     */
    public initiateCollateralWithdrawalTransactionIntent({
        xFbPlatformSignature,
        xFbapiKey,
        xFbapiNonce,
        xFbapiSignature,
        xFbapiTimestamp,
        accountId,
        collateralId,
        requestBody,
    }: {
        /**
         * Authentication signature of Fireblocks as the originator of the request
         */
        xFbPlatformSignature: string,
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
         * ID of a collateral account
         */
        collateralId: string,
        /**
         * Collateral withdrawal transaction intent request details
         */
        requestBody: CollateralWithdrawalTransactionIntentRequest,
    }): CancelablePromise<CollateralWithdrawalTransactionIntentResponse> {
        return this.httpRequest.request({
            method: 'POST',
            url: '/accounts/{accountId}/collateral/{collateralId}/intents/withdrawals',
            path: {
                'accountId': accountId,
                'collateralId': collateralId,
            },
            headers: {
                'X-FB-PLATFORM-SIGNATURE': xFbPlatformSignature,
                'X-FBAPI-KEY': xFbapiKey,
                'X-FBAPI-NONCE': xFbapiNonce,
                'X-FBAPI-SIGNATURE': xFbapiSignature,
                'X-FBAPI-TIMESTAMP': xFbapiTimestamp,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `Return Bad Request.`,
                401: `Unauthorized. Either API details are missing or invalid`,
                403: `Forbidden- You do not have access to the requested resource.`,
                415: `Unsupported media type. You need to use application/json.`,
                500: `Exchange internal error.`,
            },
        });
    }

    /**
     * Create a withdrawal from a collateral account
     * Create a withdrawal from the customers collateral account.  The withdrawal has been confirmed by the provider and signed by the customer. The amount can be reduced from the customers available balance in the provider main account based on the withdrawal amount.
     *
     * @returns CollateralWithdrawalTransaction Successful Operation
     * @throws ApiError
     */
    public createCollateralWithdrawalTransaction({
        xFbPlatformSignature,
        xFbapiKey,
        xFbapiNonce,
        xFbapiSignature,
        xFbapiTimestamp,
        accountId,
        collateralId,
        requestBody,
    }: {
        /**
         * Authentication signature of Fireblocks as the originator of the request
         */
        xFbPlatformSignature: string,
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
         * ID of a collateral account
         */
        collateralId: string,
        /**
         * Collateral withdrawal transaction details
         */
        requestBody: CollateralWithdrawalTransactionRequest,
    }): CancelablePromise<CollateralWithdrawalTransaction> {
        return this.httpRequest.request({
            method: 'POST',
            url: '/accounts/{accountId}/collateral/{collateralId}/withdrawals',
            path: {
                'accountId': accountId,
                'collateralId': collateralId,
            },
            headers: {
                'X-FB-PLATFORM-SIGNATURE': xFbPlatformSignature,
                'X-FBAPI-KEY': xFbapiKey,
                'X-FBAPI-NONCE': xFbapiNonce,
                'X-FBAPI-SIGNATURE': xFbapiSignature,
                'X-FBAPI-TIMESTAMP': xFbapiTimestamp,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `Return Bad Request.`,
                401: `Unauthorized. Either API details are missing or invalid`,
                403: `Forbidden- You do not have access to the requested resource.`,
                415: `Unsupported media type. You need to use application/json.`,
                500: `Exchange internal error.`,
            },
        });
    }

    /**
     * Get list of collateral withdrawal transactions sorted by creation time
     * @returns CollateralWithdrawalTransactions List of collateral withdrawal transactions
     * @throws ApiError
     */
    public getCollateralWithdrawalTransactions({
        xFbPlatformSignature,
        xFbapiKey,
        xFbapiNonce,
        xFbapiSignature,
        xFbapiTimestamp,
        accountId,
        collateralId,
        limit = 10,
        startingAfter,
        endingBefore,
    }: {
        /**
         * Authentication signature of Fireblocks as the originator of the request
         */
        xFbPlatformSignature: string,
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
         * ID of a collateral account
         */
        collateralId: string,
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
    }): CancelablePromise<CollateralWithdrawalTransactions> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/accounts/{accountId}/collateral/{collateralId}/withdrawals',
            path: {
                'accountId': accountId,
                'collateralId': collateralId,
            },
            headers: {
                'X-FB-PLATFORM-SIGNATURE': xFbPlatformSignature,
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
     * Get a collateral withdrawal transaction details
     * @returns CollateralWithdrawalTransaction A collateral withdrawal transaction details
     * @throws ApiError
     */
    public getCollateralWithdrawalTransactionDetails({
        xFbPlatformSignature,
        xFbapiKey,
        xFbapiNonce,
        xFbapiSignature,
        xFbapiTimestamp,
        accountId,
        collateralId,
        collateralTxId,
    }: {
        /**
         * Authentication signature of Fireblocks as the originator of the request
         */
        xFbPlatformSignature: string,
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
         * ID of a collateral account
         */
        collateralId: string,
        /**
         * A Fireblocks' ID of a collateral transaction
         */
        collateralTxId: string,
    }): CancelablePromise<CollateralWithdrawalTransaction> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/accounts/{accountId}/collateral/{collateralId}/withdrawals/{collateralTxId}',
            path: {
                'accountId': accountId,
                'collateralId': collateralId,
                'collateralTxId': collateralTxId,
            },
            headers: {
                'X-FB-PLATFORM-SIGNATURE': xFbPlatformSignature,
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
     * Initiate a settlement request from the provider
     * Request a settlement from the provider.
     * @returns SettlementInstructions Settlement instructions
     * @throws ApiError
     */
    public initiateSettlement({
        xFbPlatformSignature,
        xFbapiKey,
        xFbapiNonce,
        xFbapiSignature,
        xFbapiTimestamp,
        accountId,
        collateralId,
        requestBody,
    }: {
        /**
         * Authentication signature of Fireblocks as the originator of the request
         */
        xFbPlatformSignature: string,
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
         * ID of a collateral account
         */
        collateralId: string,
        /**
         * Collateral withdrawal transaction details
         */
        requestBody: SettlementRequest,
    }): CancelablePromise<SettlementInstructions> {
        return this.httpRequest.request({
            method: 'POST',
            url: '/accounts/{accountId}/collateral/{collateralId}/settlement',
            path: {
                'accountId': accountId,
                'collateralId': collateralId,
            },
            headers: {
                'X-FB-PLATFORM-SIGNATURE': xFbPlatformSignature,
                'X-FBAPI-KEY': xFbapiKey,
                'X-FBAPI-NONCE': xFbapiNonce,
                'X-FBAPI-SIGNATURE': xFbapiSignature,
                'X-FBAPI-TIMESTAMP': xFbapiTimestamp,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `Return Bad Request.`,
                401: `Unauthorized. Either API details are missing or invalid`,
                403: `Forbidden- You do not have access to the requested resource.`,
                415: `Unsupported media type. You need to use application/json.`,
                500: `Exchange internal error.`,
            },
        });
    }

    /**
     * Get current Instructions for settlement
     * Gets a list of required transactions to finalize the settlement
     *
     * @returns SettlementInstructions Settlement instructions
     * @throws ApiError
     */
    public getCurrentSettlementInstructions({
        xFbPlatformSignature,
        xFbapiKey,
        xFbapiNonce,
        xFbapiSignature,
        xFbapiTimestamp,
        accountId,
        collateralId,
    }: {
        /**
         * Authentication signature of Fireblocks as the originator of the request
         */
        xFbPlatformSignature: string,
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
         * ID of a collateral account
         */
        collateralId: string,
    }): CancelablePromise<SettlementInstructions> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/accounts/{accountId}/collateral/{collateralId}/settlement',
            path: {
                'accountId': accountId,
                'collateralId': collateralId,
            },
            headers: {
                'X-FB-PLATFORM-SIGNATURE': xFbPlatformSignature,
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
     * Get a settlement details
     * @returns SettlementState A specific settlement details
     * @throws ApiError
     */
    public getSettlementDetails({
        xFbPlatformSignature,
        xFbapiKey,
        xFbapiNonce,
        xFbapiSignature,
        xFbapiTimestamp,
        accountId,
        collateralId,
        settlementVersion,
    }: {
        /**
         * Authentication signature of Fireblocks as the originator of the request
         */
        xFbPlatformSignature: string,
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
         * ID of a collateral account
         */
        collateralId: string,
        /**
         * A provider version ID of a settlement state
         */
        settlementVersion: string,
    }): CancelablePromise<SettlementState> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/accounts/{accountId}/collateral/{collateralId}/settlements/{settlementVersion}',
            path: {
                'accountId': accountId,
                'collateralId': collateralId,
                'settlementVersion': settlementVersion,
            },
            headers: {
                'X-FB-PLATFORM-SIGNATURE': xFbPlatformSignature,
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
