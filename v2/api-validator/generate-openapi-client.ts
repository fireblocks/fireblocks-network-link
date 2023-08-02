import config from './src/config';
import { generate } from 'openapi-typescript-codegen';
import { mkdirpSync, removeSync } from 'fs-extra';

async function generateClient() {
  const openApi = config.get('openApi');

  removeSync(openApi.generatedClientLocation);
  mkdirpSync(openApi.generatedClientLocation);

  await generate({
    clientName: 'ApiClient',
    input: config.getUnifiedOpenApiPathname(),
    output: openApi.generatedClientLocation,
    httpClient: 'axios',
    useOptions: true,
  });
}

console.log('\n🧸 Generating API client');

generateClient()
  .then(() => console.log('✅ API client generated successfully'))
  .catch((e) => console.error('❌ API client failed to generate', e));
