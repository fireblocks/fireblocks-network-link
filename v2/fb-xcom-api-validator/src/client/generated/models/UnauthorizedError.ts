/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { RequestPart } from './RequestPart';

/**
 * Request is unauthorized
 */
export type UnauthorizedError = {
    /**
     * Description of the error.
     */
    message: string;
    errorType: UnauthorizedError.errorType;
    /**
     * Name of property that caused the error.
     */
    propertyName?: string;
    requestPart?: RequestPart;
};

export namespace UnauthorizedError {

    export enum errorType {
        SCHEMA_ERROR = 'schema-error',
        SCHEMA_PROPERTY_ERROR = 'schema-property-error',
        UNAUTHORIZED = 'unauthorized',
    }


}

