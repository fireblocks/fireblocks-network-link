import VError from 'verror';
import config from './config';
import pino from 'pino';
import { XComError } from './error';

export type ObjectType = Record<string, unknown>;
export type ErrorType = XComError | Error | ObjectType;
export type LogFn = (msg: string, data?: ObjectType) => void;
export type ErrorLogFn = (msg: string, data?: ObjectType, error?: ErrorType) => void;

export class Logger {
  readonly fatal: LogFn;
  readonly error: ErrorLogFn;
  readonly warn: ErrorLogFn;
  readonly info: LogFn;
  readonly debug: LogFn;
  readonly trace: LogFn;
  public readonly pinoLogger: pino.Logger;

  constructor(options: pino.LoggerOptions) {
    this.pinoLogger = pino(options);

    const makeLogFn = (pinoFn: pino.LogFn): LogFn => {
      return (msg, data?) => pinoFn.bind(this.pinoLogger)({ msg, data });
    };

    const makeErrorLogFn = (pinoFn: pino.LogFn): ErrorLogFn => {
      return (msg: string, data?: ObjectType, error?: ErrorType) => {
        const errorData = error ? extractErrorData(error) : {};
        const completeData = { ...data, ...errorData };
        return pinoFn.bind(this.pinoLogger)({
          msg,
          data: completeData,
        });
      };
    };

    this.fatal = makeLogFn(this.pinoLogger.fatal);
    this.error = makeErrorLogFn(this.pinoLogger.error);
    this.warn = makeErrorLogFn(this.pinoLogger.warn);
    this.info = makeLogFn(this.pinoLogger.info);
    this.debug = makeLogFn(this.pinoLogger.debug);
    this.trace = makeLogFn(this.pinoLogger.trace);
  }
}

function extractErrorData(error: ErrorType): ObjectType {
  const name = error['name'];
  const errorMessage = error.message;

  const basicErrorData = { name, errorMessage };

  if (error instanceof XComError) {
    return {
      ...basicErrorData,
      ...error.data,
      ...VError.info(error),
      stack: VError.fullStack(error),
    };
  }

  if (error instanceof Error) {
    const { name, message: errorMessage } = error;
    return { name, errorMessage, stack: error.stack };
  }

  return error;
}

export default function createLogger(namespace: string): Logger {
  return new Logger({
    name: namespace,
    level: config.get('logging').level,
    formatters: {
      level(label) {
        return { level: label };
      },
    },
  });
}
