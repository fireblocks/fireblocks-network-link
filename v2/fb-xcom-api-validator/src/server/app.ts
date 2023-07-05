import Fastify, { RouteOptions } from 'fastify';
import config from '../config';
import logger from '../logging';

const log = logger('app');

export class WebApp {
  private readonly app: ReturnType<typeof Fastify>;
  constructor() {
    this.app = Fastify({ logger: log.pinoLogger });
  }

  public async start(): Promise<void> {
    const { port } = config.get('server');
    await this.app.listen({ port, host: '0.0.0.0' });
  }

  public addRoute({ method, url, handler }: RouteOptions): void {
    this.app.route({
      method,
      url,
      handler,
    });
  }
}
