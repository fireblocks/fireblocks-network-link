import { WebApp } from "./app";
import { verifySignatureMiddleware } from "./middlewares/verify-signature-middleware";

export const registerMiddlewares = (app: WebApp) => {
    app.addMiddleware(verifySignatureMiddleware);
}