import { ResponseSchemaValidator } from '../../src/client/response-schema-validator';

const version = '0.0.1';

const requiredComponents = {
  accounts: '*',
  balances: '*',
};

const optionalComponents = {
  transfers: '*',
  transfersBlockchain: '*',
  transfersFiat: '*',
  transfersPeerAccounts: '*',
  liquidity: ['account1', 'account2'],
};

describe('Response schema validator', () => {
  const validator = new ResponseSchemaValidator();

  describe('GET /capabilities', () => {
    const validate = async (response) => validator.validate('GET', '/capabilities', response);

    it('should pass the validation if all components are present', async () => {
      const result = await validate({
        version,
        components: { ...requiredComponents, ...optionalComponents },
      });
      expect(result.success).toEqual(true);
    });

    it('should pass the validation if only the required components are present', async () => {
      const result = await validate({
        version,
        components: { ...requiredComponents },
      });
      expect(result.success).toEqual(true);
    });

    it('should fail the validation if version is not a string', async () => {
      const result = await validate({
        version: 1000,
        components: { ...requiredComponents },
      });
      expect(result.success).toEqual(false);
      await expect(result.error?.keyword).toEqual('type');
      await expect(result.error?.params).toEqual({ type: 'string' });
      await expect(result.error?.instancePath).toEqual('/version');
    });

    it('should fail the validation if version not specified', async () => {
      const result = await validate({
        components: { ...requiredComponents, ...optionalComponents },
      });
      await expect(result.success).toEqual(false);
      await expect(result.error?.keyword).toEqual('required');
      await expect(result.error?.params).toEqual({ missingProperty: 'version' });
    });
  });
});
