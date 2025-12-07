import config from '../config';
import logger from '../logging';
import { createWebApp } from './app';
import { AccountsController } from './controllers/accounts-controller';
import { AssetsController } from './controllers/assets-controller';

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
  if (config.get('mockServerCapabilitiesDir')) {
    log.info('Will load server capabilities from preset', {
      presetDir: config.get('mockServerCapabilitiesDir'),
    });
  } else {
    log.warn('Will generate random server capabilities', {
      presetDir: config.get('mockServerCapabilitiesDir'),
    });
  }

  try {
    const app = await createWebApp();
    AssetsController.loadAdditionalAssets();
    AccountsController.loadAccounts();
    await app.start();
  } catch (err: unknown) {
    handleError(err);
  }
}

start();
