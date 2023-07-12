import Client from '../src/client';

describe('Capabilities', () => {
  describe('Most naive one', () => {
    let result;

    beforeAll(async () => {
      const client = new Client();
      await client.capabilities.getCapabilities({});
    });

    it('should work', () => {
      expect(result).toEqual('Vigilo Confido');
    });
  });
});
