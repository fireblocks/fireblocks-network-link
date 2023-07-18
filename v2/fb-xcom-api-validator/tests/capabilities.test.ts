import { Capabilities } from '../src/client/generated';

const KNWON_API_VERSIONS = ['0.0.1'];

describe('Capabilities', () => {
  describe('/capabilities', () => {
    const capabilities: Capabilities = global.capabilities;

    it('should include a valid api version', () => {
      expect(isValidApiVersion(capabilities.version)).toBe(true);
    });
  });
});

function isValidApiVersion(apiVersion: string) {
  return KNWON_API_VERSIONS.includes(apiVersion);
}
