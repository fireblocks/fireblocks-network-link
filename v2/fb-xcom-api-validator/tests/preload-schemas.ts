import 'ts-node/register';
import config from '../src/config';
import { parseOpenApiYaml } from '../src/server/schema';

async function preloadSchemas() {
  const openApiYamlPathname = config.getUnifiedOpenApiPathname();
  const allEndpoints = await parseOpenApiYaml(openApiYamlPathname);
  global['supportedOpenApiEndpoints'] = await filterServerSupportedEndpoints(allEndpoints);
}

async function filterServerSupportedEndpoints(allEndpoints) {
  return allEndpoints;
}

module.exports = preloadSchemas;
