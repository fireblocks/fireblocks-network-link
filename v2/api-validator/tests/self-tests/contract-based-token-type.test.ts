import { Blockchain, ContractBasedToken } from '../../src/client/generated';

describe('ContractBasedToken type', () => {
  it('should include Trc20Token in the type enum', () => {
    expect(ContractBasedToken.type.TRC20TOKEN).toBe('Trc20Token');
  });

  it('should include Jetton in the type enum', () => {
    expect(ContractBasedToken.type.JETTON).toBe('Jetton');
  });

  it('should accept Trc20Token as a valid ContractBasedToken', () => {
    const trc20Asset: ContractBasedToken = {
      id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
      type: ContractBasedToken.type.TRC20TOKEN,
      blockchain: Blockchain.TRON,
      name: 'Tether USD',
      symbol: 'USDT',
      decimalPlaces: 6,
      testAsset: true,
      contractAddress: 'TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t',
    };
    expect(trc20Asset.type).toBe('Trc20Token');
    expect(trc20Asset.blockchain).toBe('TRON');
    expect(trc20Asset.contractAddress).toBeDefined();
  });
});
