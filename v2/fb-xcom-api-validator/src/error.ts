import VError from 'verror';

export class XComError extends VError {
  constructor(
    message: string,
    public data?: Record<string, unknown>,
    public readonly originalError?: Error | any
  ) {
    super({ cause: originalError, info: { ...data, ...originalError } }, message);
  }
}
