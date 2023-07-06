import path from 'path';
import config from '../config';
import logger from '../logging';
import Fastify, { HTTPMethods, RouteOptions } from 'fastify';
import { FastifySchemas, loadFastifySchemas } from './schemas';

const log = logger('app');

export async function createWebApp(): Promise<WebApp> {
  const openApiConfig = config.get('openApi');
  const openApiYamlPathname = path.join(openApiConfig.location, openApiConfig.unifiedFilename);
  const schemas = await loadFastifySchemas(openApiYamlPathname);

  return new WebApp(schemas);
}

export class WebApp {
  private readonly app: ReturnType<typeof Fastify>;

  constructor(private readonly schemas: FastifySchemas) {
    this.app = Fastify({ logger: log.pinoLogger });
  }

  public async start(): Promise<void> {
    const { port } = config.get('server');
    await this.app.listen({ port, host: '0.0.0.0' });
  }

  public addRoute(method: HTTPMethods, url: string, handler: RouteOptions['handler']): void {
    this.app.route({
      method,
      url,
      handler,
      schema: this.schemas.getSchema(method, url),
    });
  }
}
