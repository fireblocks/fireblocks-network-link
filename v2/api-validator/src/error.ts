import VError from 'verror';
import { ErrorObject } from 'ajv/lib/types';

export class XComError extends VError {
  constructor(
    public readonly message: string,
    public readonly data?: Record<string, unknown>,
    public readonly originalError?: Error | any
  ) {
    super({ cause: originalError, info: { ...data, ...originalError } }, message);
  }
}

export class SchemaCompilationError extends XComError {
  constructor(message: string, method: string, url: string) {
    super(message, { method, url });
  }
}

export class ResponseSchemaValidationFailed extends XComError {
  constructor(method: string, url: string, response: any, error?: ErrorObject) {
    super('Schema validation failed', { method, url, response, error });
  }
}
