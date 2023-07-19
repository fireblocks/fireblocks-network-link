import { WebApp } from './app';
import { handleGetAdditionalAssets } from './handlers/additional-assets-handler';
import { handleGetCapabilities } from './handlers/capabilities-handler';

export function registerRoutes(app: WebApp): void {
  app.addRoute('GET', '/capabilities', handleGetCapabilities);
  app.addRoute('POST', '/accounts/:accountId/trading/orders', handleGetCapabilities);
  app.addRoute('GET', '/capabilities/assets', handleGetAdditionalAssets);
}
