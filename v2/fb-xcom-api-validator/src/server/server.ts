import logger from '../logging';

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
    log.info('Starting service 1');
    log.debug('Starting service 2');
  } catch (err: unknown) {
    handleError(err);
  }
}

start();
