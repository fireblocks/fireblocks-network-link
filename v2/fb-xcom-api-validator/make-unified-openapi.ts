import _ from 'lodash';
import path from 'path';
import config from './src/config';
import { readFileSync, writeFileSync } from 'fs';
import { dump as dumpYaml, load as loadYaml } from 'js-yaml';

const TARGET_OPENAPI_PATH = config.getUnifiedOpenApiPathname();
const IGNORE_PATH_LABEL = 'Private';

interface OpenAPI {
  openapi: string;
  servers: { url: string }[];
  info: { version: string; title: string };
  tags: { name: string }[];
  paths: Record<string, any>;
  components: {
    securitySchemes: Record<string, any>;
    parameters: Record<string, any>;
    responses: Record<string, any>;
    schemas: Record<string, any>;
  };
  [name: string]: any;
}

function extractServiceName(servicePath: string): string | undefined {
  const regRes = /.*fb-provider-(.*)-api.yaml/.exec(servicePath);
  return regRes ? regRes[1] : undefined;
}

async function makeUnifiedOpenApi() {
  const openApi = config.get('openApi');

  const baseOpenApiFilePath = path.join(openApi.location, openApi.components[0]);
  const completeOpenAPI: OpenAPI = loadYaml(readFileSync(baseOpenApiFilePath, 'utf8'));

  const methods = ['get', 'post', 'put', 'patch', 'delete', 'head', 'options'];

  const refReplacements: Record<string, string> = {};

  for (let i = 1; i < openApi.components.length; i++) {
    const openApiPath = path.join(openApi.location, openApi.components[i]);
    const serviceOpenAPI: OpenAPI = loadYaml(readFileSync(openApiPath, 'utf8'));

    // Here we merge every OpenAPI for each service and merge only some of the data into the aggregated OpenAPI
    completeOpenAPI.tags = _.unionBy(completeOpenAPI.tags, serviceOpenAPI.tags, 'name');
    completeOpenAPI.paths = _.merge(
      completeOpenAPI.paths,
      Object.entries(serviceOpenAPI.paths).reduce((result, [path, pathData]) => {
        methods.forEach((method) => {
          if (pathData[method] && !pathData[method].tags?.includes(IGNORE_PATH_LABEL)) {
            result[path] = pathData;
            return;
          }
        });

        return result;
      }, {})
    );
    completeOpenAPI.components.securitySchemes = _.merge(
      completeOpenAPI.components.securitySchemes,
      serviceOpenAPI.components.securitySchemes
    );
    completeOpenAPI.components.parameters = _.merge(
      completeOpenAPI.components.parameters,
      serviceOpenAPI.components.parameters
    );
    completeOpenAPI.components.schemas = _.merge(
      completeOpenAPI.components.schemas,
      serviceOpenAPI.components.schemas
    );
    completeOpenAPI.components.responses = _.merge(
      completeOpenAPI.components.responses,
      serviceOpenAPI.components.responses
    );
    for (const key of Object.keys(serviceOpenAPI)) {
      if (key.startsWith('x-')) {
        if (key.endsWith('-params')) {
          refReplacements[key] = 'components/parameters';
        }
        if (key.endsWith('-schemas')) {
          refReplacements[key] = 'components/schemas';
        }
      }
    }

    console.log(`📦 Component [\x1b[33m ${extractServiceName(openApiPath)} \x1b[0m] added`);
  }

  let resultYaml: string = dumpYaml(completeOpenAPI, {
    noRefs: true,
    noCompatMode: true,
    lineWidth: -1,
  });

  for (const [key, rep] of Object.entries(refReplacements)) {
    const regex = new RegExp(key, 'g');
    resultYaml = resultYaml.replace(regex, rep);
  }
  writeFileSync(TARGET_OPENAPI_PATH, resultYaml);
}

makeUnifiedOpenApi()
  .then(() => console.log('✅ OpenAPI generated successfully', TARGET_OPENAPI_PATH))
  .catch((e) => {
    console.error('❌ OpenAPI failed to generate.', e);
    process.exit(1);
  });
