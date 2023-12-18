/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { RequestPart } from './RequestPart';

/**
 * Request could not be processed due to a client error.
 * If the error is caused by a missing or wrong property in the request, `errorType` must have the value `schema-property-error` and the properties  `propertyName` and `requestPart` must be specified. For more general schema errors, the error type should be `schema-error` and `requestPart` must be specified. For all the other cases the error type should be `bad-request`.
 */
export type BadRequestError = {
    /**
     * Description of the error.
     */
    message: string;
    errorType: BadRequestError.errorType;
    /**
     * Name of property that caused the error.
     */
    propertyName?: string;
    requestPart?: RequestPart;
};

export namespace BadRequestError {

    export enum errorType {
        SCHEMA_ERROR = 'schema-error',
        SCHEMA_PROPERTY_ERROR = 'schema-property-error',
        BAD_REQUEST = 'bad-request',
        UNKNOWN_ASSET = 'unknown-asset',
        UNSUPPORTED_CONVERSION = 'unsupported-conversion',
        QUOTE_NOT_READY = 'quote-not-ready',
        DEPOSIT_ADDRESS_DISABLED = 'deposit-address-disabled',
        ORDER_NOT_TRADING = 'order-not-trading',
        IDEMPOTENCY_KEY_REUSE = 'idempotency-key-reuse',
        DEPOSIT_ADDRESS_CREATION_NOT_ALLOWED = 'deposit-address-creation-not-allowed',
        UNSUPPORTED_TRANSFER_METHOD = 'unsupported-transfer-method',
    }


}

