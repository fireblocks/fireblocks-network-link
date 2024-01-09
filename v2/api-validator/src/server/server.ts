import logger from '../logging';
import { createWebApp } from './app';
import { AccountsController } from './controllers/accounts-controller';
import { AssetsController } from './controllers/assets-controller';
import { BooksController } from './controllers/books-controller';

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
    const app = await createWebApp();
    AssetsController.generateAdditionalAssets();
    AccountsController.generateAccounts();
    BooksController.loadBooks();
    await app.start();
  } catch (err: unknown) {
    handleError(err);
  }
}

start();
