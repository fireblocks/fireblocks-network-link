import path from 'path';
import config from '../config';
import logger from '../logging';
import Fastify, { HTTPMethods, RouteOptions } from 'fastify';
import { OpenApiSchema, loadOpenApiSchema } from './schema';

const log = logger('app');

export async function createWebApp(): Promise<WebApp> {
  const openApiConfig = config.get('openApi');
  const openApiYamlPathname = path.join(openApiConfig.location, openApiConfig.unifiedFilename);
  const schema = await loadOpenApiSchema(openApiYamlPathname);

  return new WebApp(schema);
}

export class WebApp {
  private readonly app: ReturnType<typeof Fastify>;

  constructor(private readonly schema: OpenApiSchema) {
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
      schema: this.schema.getOperationSchema(method, url),
    });
  }
}
