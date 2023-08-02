import config from '../../src/config';
import { isExpired } from '../../src/server/middlewares/timestamp-middleware';

describe('Validating timestamp', () => {
  let configuredTTLInSeconds: number;

  beforeAll(() => {
    configuredTTLInSeconds = config.get('authentication').requestTTL;
    expect(configuredTTLInSeconds).toBeDefined();
  });

  it('should be expired when timestamp is older than configured ttl', () => {
    const timestamp = Date.now() - configuredTTLInSeconds * 1000 - 1;
    expect(isExpired(timestamp)).toBe(true);
  });

  it('should not be expired when timestamp is newer than configured ttl', () => {
    const newerTimestamp = Date.now() - configuredTTLInSeconds * 1000 + 1;
    expect(isExpired(newerTimestamp)).toBe(false);
  });
});
