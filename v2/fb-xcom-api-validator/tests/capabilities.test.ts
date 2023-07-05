import config from '../src/config';
import { Http } from '../src/client/http';

const { serverBaseUrl } = config.get('client');

describe('Capabilities', () => {
  const http = new Http(serverBaseUrl);

  describe('Most naive one', () => {
    let result;

    beforeAll(async () => {
      result = await http.get('/capabilities');
    });

    it('should work', () => {
      expect(result).toEqual('Vigilo Confido');
    });
  });
});
