/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

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
    propertyName?: UnauthorizedError.propertyName;
    /**
     * Request part where the error occurred.
     */
    requestPart?: UnauthorizedError.requestPart;
};

export namespace UnauthorizedError {

    export enum errorType {
        UNAUTHORIZED = 'unauthorized',
    }

    /**
     * Name of property that caused the error.
     */
    export enum propertyName {
        X_FBAPI_KEY = 'X-FBAPI-KEY',
    }

    /**
     * Request part where the error occurred.
     */
    export enum requestPart {
        HEADERS = 'headers',
    }


}
