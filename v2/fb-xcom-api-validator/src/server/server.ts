import logger from '../logging';
import { WebApp } from './app';
import { registerRoutes } from './routes';

const log = logger('server');

function handleError(err: unknown) {
  if (err instanceof Error) {
    log.error('Error in server.start()', {
      name: err.name,
      message: err.message,
      stack: err.stack,
    });
  } else {
    log.error('Error in server.start()', {
      message: err,
    });
  }

  process.exit(1);
}

process.on('uncaughtException', handleError);
process.on('unhandledRejection', handleError);

async function start() {
  try {
    const app = new WebApp();
    registerRoutes(app);
    await app.start();
  } catch (err: unknown) {
    handleError(err);
  }
}

start();
