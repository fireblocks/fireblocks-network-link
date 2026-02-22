import { Blockchain, ContractBasedToken } from '../../src/client/generated';

describe('ContractBasedToken type', () => {
  it('should include Trc20Token in the type enum', () => {
    expect(ContractBasedToken.type.TRC20TOKEN).toBe('Trc20Token');
  });

  it('should include Jetton in the type enum', () => {
    expect(ContractBasedToken.type.JETTON).toBe('Jetton');
  });
});
