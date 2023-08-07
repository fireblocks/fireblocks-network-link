import 'ts-node/register';
import config from '../../src/config';
import { loadOpenApiSchemas } from '../../src/schemas';

async function preloadSchemas() {
  const openApiYamlPathname = config.getUnifiedOpenApiPathname();
  await loadOpenApiSchemas(openApiYamlPathname);
}

module.exports = preloadSchemas;
