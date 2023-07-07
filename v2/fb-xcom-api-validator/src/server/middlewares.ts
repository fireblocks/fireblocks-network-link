import { WebApp } from "./app";
import { authMiddleware } from "./middlewares/auth-middleware";

export const registerMiddlewares = (app: WebApp) => {
    app.addMiddleware(authMiddleware);
}