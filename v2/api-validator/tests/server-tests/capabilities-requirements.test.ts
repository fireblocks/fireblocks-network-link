import Client from '../../src/client';
import {
  Capabilities,
  CapabilitiesWithRequirements,
  WithdrawalAddressPolicyRequirement,
} from '../../src/client/generated';

describe('Capabilities Requirements', () => {
  let client: Client;
  let capabilities: Capabilities;

  beforeAll(async () => {
    client = new Client();
    capabilities = await client.capabilities.getCapabilities({});
  });

  describe('CapabilitiesWithRequirements schema validation', () => {
    it('should have valid requirements structure when present', () => {
      if (capabilities.requirements) {
        expect(capabilities.requirements).toBeDefined();
        expect(typeof capabilities.requirements).toBe('object');
      }
    });

    it('should only contain transfersBlockchain requirements', () => {
      if (capabilities.requirements) {
        const validKeys = ['transfersBlockchain'];
        const actualKeys = Object.keys(capabilities.requirements);
        actualKeys.forEach((key) => {
          expect(validKeys).toContain(key);
        });
      }
    });
  });

  describe('CapabilityRequirements schema validation', () => {
    it('should have valid transfersBlockchain requirements structure', () => {
      if (capabilities.requirements?.transfersBlockchain) {
        const blockchainReqs = capabilities.requirements.transfersBlockchain;
        expect(blockchainReqs).toBeDefined();
        expect(typeof blockchainReqs).toBe('object');
      }
    });

    it('should only contain valid requirement types', () => {
      if (capabilities.requirements?.transfersBlockchain) {
        const validKeys = ['withdrawalAddressPolicy'];
        const actualKeys = Object.keys(capabilities.requirements.transfersBlockchain);
        actualKeys.forEach((key) => {
          expect(validKeys).toContain(key);
        });
      }
    });
  });

  describe('WithdrawalAddressPolicyRequirement schema validation', () => {
    it('should have a value property when present', () => {
      if (capabilities.requirements?.transfersBlockchain?.withdrawalAddressPolicy) {
        const policy = capabilities.requirements.transfersBlockchain.withdrawalAddressPolicy;
        expect(policy.value).toBeDefined();
      }
    });

    it('should have a valid enum value', () => {
      if (capabilities.requirements?.transfersBlockchain?.withdrawalAddressPolicy) {
        const policy = capabilities.requirements.transfersBlockchain.withdrawalAddressPolicy;
        const validValues = ['ApprovedAddressesOnly', 'AllAddresses'];
        expect(validValues).toContain(policy.value);
      }
    });

    it('should match the WithdrawalAddressPolicyRequirement.value enum', () => {
      if (capabilities.requirements?.transfersBlockchain?.withdrawalAddressPolicy) {
        const policy = capabilities.requirements.transfersBlockchain.withdrawalAddressPolicy;
        const enumValues = Object.values(WithdrawalAddressPolicyRequirement.value);
        expect(enumValues).toContain(policy.value);
      }
    });
  });

  describe('Requirements and components consistency', () => {
    it('should only have requirements for components that exist', () => {
      if (capabilities.requirements?.transfersBlockchain) {
        expect(capabilities.components.transfersBlockchain).toBeDefined();
      }
    });

    it('should not have requirements for non-existent components', () => {
      if (capabilities.requirements) {
        // If requirements exist, they should only reference existing components
        if (capabilities.requirements.transfersBlockchain) {
          expect(capabilities.components.transfersBlockchain).toBeDefined();
        }
      }
    });
  });

  describe('Requirements example validation', () => {
    it('should validate the example from OpenAPI spec', () => {
      // This validates the example provided in the OpenAPI spec
      const exampleRequirements: CapabilitiesWithRequirements = {
        transfersBlockchain: {
          withdrawalAddressPolicy: {
            value: WithdrawalAddressPolicyRequirement.value.APPROVED_ADDRESSES_ONLY,
          },
        },
      };

      expect(exampleRequirements).toBeDefined();
      expect(exampleRequirements.transfersBlockchain).toBeDefined();
      expect(exampleRequirements.transfersBlockchain?.withdrawalAddressPolicy?.value).toBe(
        'ApprovedAddressesOnly'
      );
    });

    it('should validate all possible WithdrawalAddressPolicy values', () => {
      const approvedOnly: WithdrawalAddressPolicyRequirement = {
        value: WithdrawalAddressPolicyRequirement.value.APPROVED_ADDRESSES_ONLY,
      };
      expect(approvedOnly.value).toBe('ApprovedAddressesOnly');

      const allAddresses: WithdrawalAddressPolicyRequirement = {
        value: WithdrawalAddressPolicyRequirement.value.ALL_ADDRESSES,
      };
      expect(allAddresses.value).toBe('AllAddresses');
    });
  });
});
