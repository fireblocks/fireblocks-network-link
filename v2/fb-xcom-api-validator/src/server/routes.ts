import { WebApp } from './app';
import { handleGetCapabilities } from './handlers/capabilities-handler';

export function registerRoutes(app: WebApp): void {
  app.addRoute('GET', '/capabilities', handleGetCapabilities);
}
