import { WebApp } from './app';
import { verifySignatureMiddleware } from './middlewares/verify-signature-middleware';

export function registerMiddlewares(app: WebApp): void {
  app.addMiddleware(verifySignatureMiddleware);
}
