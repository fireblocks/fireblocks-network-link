import { pino as Pino } from 'pino';
import config from './config';

export type ObjectType = Record<string, unknown>;
export type LogFn = (msg: string, data?: ObjectType) => void;
export type ErrorLogFn = (msg: string, data?: ObjectType, error?: ObjectType) => void;

export class Logger {
  readonly fatal: LogFn;
  readonly error: ErrorLogFn;
  readonly warn: ErrorLogFn;
  readonly info: LogFn;
  readonly debug: LogFn;
  readonly trace: LogFn;
  public readonly pinoLogger: Pino.Logger;

  constructor(options: Pino.LoggerOptions) {
    this.pinoLogger = Pino(options);

    const makeLogFn = (pinoFn: Pino.LogFn): LogFn => {
      return (msg, data?) => pinoFn.bind(this.pinoLogger)({ msg, data });
    };

    const makeErrorLogFn = (pinoFn: Pino.LogFn): ErrorLogFn => {
      return (msg: string, data?: ObjectType, error?: ObjectType) => {
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

function extractErrorData(error: ObjectType): ObjectType {
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
