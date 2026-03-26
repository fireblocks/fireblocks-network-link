/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { BadRequestErrorType } from './BadRequestErrorType';
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
    errorType: BadRequestErrorType;
    /**
     * Name of property that caused the error. By convention, should always start with a slash ("/"). If the property is nested, the path should be separated by slashes.
     * This property is required if the error type is caused by a missing or wrong property in the request.
     */
    propertyName?: string;
    requestPart?: RequestPart;
};

