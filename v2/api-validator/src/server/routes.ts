import { WebApp } from './app';
import { handleGetAdditionalAssets } from './handlers/additional-assets-handler';
import { handleGetAssetDetails } from './handlers/asset-details-handler';
import { handleCreateOrder } from './handlers/trading-handlers';
import { handleGetCapabilities } from './handlers/capabilities-handler';
import { handleCreateBlockchainWithdrawal } from './handlers/transfer-handlers';
import { handleCreateQuote } from './handlers/liguidity-handlers';
import { getAccountDetails, getAccounts } from './handlers/account-handlers';

export function registerRoutes(app: WebApp): void {
  app.addRoute('GET', '/capabilities', handleGetCapabilities);
  app.addRoute('GET', '/capabilities/assets', handleGetAdditionalAssets);
  app.addRoute('GET', '/capabilities/assets/:id', handleGetAssetDetails);
  app.addRoute('POST', '/accounts/:accountId/liquidity/quotes', handleCreateQuote);
  app.addRoute('POST', '/accounts/:accountId/trading/orders', handleCreateOrder);
  app.addRoute(
    'POST',
    '/accounts/:accountId/transfers/withdrawals/blockchain',
    handleCreateBlockchainWithdrawal
  );
  app.addRoute(
    'POST',
    '/accounts/:accountId/transfers/withdrawals/fiat',
    handleCreateBlockchainWithdrawal
  );
  app.addRoute(
    'POST',
    '/accounts/:accountId/transfers/withdrawals/peeraccount',
    handleCreateBlockchainWithdrawal
  );
  app.addRoute(
    'POST',
    '/accounts/:accountId/transfers/withdrawals/subaccount',
    handleCreateBlockchainWithdrawal
  );
  app.addRoute(
    'POST',
    '/accounts/:accountId/transfers/deposits/addresses',
    handleCreateBlockchainWithdrawal
  );
  app.addRoute('GET', '/accounts', getAccounts);
  app.addRoute('GET', '/accounts/:accountId', getAccountDetails);
}
