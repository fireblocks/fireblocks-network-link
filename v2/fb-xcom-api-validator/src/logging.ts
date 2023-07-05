import { pino as Pino } from 'pino';

export default function createLogger(namespace: string): Pino.Logger {
  const logger = Pino({
    name: namespace,
    level: 'debug',
    formatters: {
      level(label) {
        return { level: label };
      },
    },
  });

  return logger;
}
