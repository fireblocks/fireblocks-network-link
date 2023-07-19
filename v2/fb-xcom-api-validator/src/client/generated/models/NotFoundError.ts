/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

/**
 * Requested resource not found
 */
export type NotFoundError = {
    /**
     * Description of the error.
     */
    message: string;
    errorType: NotFoundError.errorType;
};

export namespace NotFoundError {

    export enum errorType {
        NOT_FOUND = 'not-found',
    }


}

