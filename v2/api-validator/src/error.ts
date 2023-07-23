import VError from 'verror';

export class XComError extends VError {
  constructor(
    public readonly message: string,
    public readonly data?: Record<string, unknown>,
    public readonly originalError?: Error | any
  ) {
    super({ cause: originalError, info: { ...data, ...originalError } }, message);
  }
}
