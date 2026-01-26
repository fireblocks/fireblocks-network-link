import { randomUUID } from 'crypto';
import Client from '../../src/client';
import { getAllCapableAccountIds, hasCapability } from '../utils/capable-accounts';
import {
  BlockchainWithdrawalRequest,
  ParticipantsIdentification,
  PersonaIdentificationInfo,
  ParticipantRelationshipType,
  CountryAlpha2Code,
  PostalAddress,
  FullName,
  VaspInformation,
  PublicBlockchainCapability,
  WithdrawalCapability,
  AssetBalance,
} from '../../src/client/generated';
import config from '../../src/config';

const noTransfersBlockchainCapability = !hasCapability('transfersBlockchain');
const blockchainTransfersCapableAccountIds = getAllCapableAccountIds('transfersBlockchain');

describe.skipIf(noTransfersBlockchainCapability)('VASP Information Validation', () => {
  let client: Client;
  let accountCapabilitiesMap: Map<string, WithdrawalCapability[]>;
  const blockchainDestinationConfig = config.get('withdrawal.blockchain');

  const fullName: FullName = { firstName: 'John', lastName: 'Doe' };

  const postalAddress: PostalAddress = {
    streetName: 'Main St',
    buildingNumber: '101',
    postalCode: '54321',
    city: 'Los Angeles',
    subdivision: 'CA',
    district: 'La La Land',
    country: CountryAlpha2Code.US,
  };

  const personaIdentificationInfo: PersonaIdentificationInfo = {
    externalReferenceId: 'externalReferenceId',
    participantRelationshipType: ParticipantRelationshipType.FIRST_PARTY,
    entityType: PersonaIdentificationInfo.entityType.INDIVIDUAL,
    fullName,
    dateOfBirth: '1985-05-10',
    postalAddress,
  };

  const getCapabilities = async (accountId: string, limit: number, startingAfter?) => {
    const response = await client.capabilities.getWithdrawalMethods({
      accountId,
      limit,
      startingAfter,
    });
    return response.capabilities;
  };

  const getCapabilityAssetBalance = async (
    accountId: string,
    capability: WithdrawalCapability
  ): Promise<AssetBalance | undefined> => {
    const { balances } = await client.balances.getBalances({
      accountId,
      ...capability.balanceAsset,
    });

    if (balances.length !== 1) {
      return;
    }

    return balances[0];
  };

  beforeAll(async () => {
    client = new Client();
    accountCapabilitiesMap = new Map();

    for (const accountId of blockchainTransfersCapableAccountIds) {
      const capabilities = await getCapabilities(accountId, 100);
      accountCapabilitiesMap.set(accountId, capabilities);
    }
  }, 60000);

  describe('VaspInformation schema validation', () => {
    it('should accept complete VASP information', async () => {
      const completeVasp: VaspInformation = {
        vaspName: 'Complete VASP Inc',
        vaspCountry: 'US',
        vaspCode: 'VASP123',
        vaspWebsite: 'https://complete-vasp.example.com',
        vaspRegion: 'North America',
      };

      for (const [accountId, capabilities] of accountCapabilitiesMap.entries()) {
        const blockchainCapabilities = capabilities.filter(
          (c) =>
            c.withdrawal.transferMethod === PublicBlockchainCapability.transferMethod.PUBLIC_BLOCKCHAIN
        );

        for (const capability of blockchainCapabilities) {
          const minWithdrawalAmount = capability.minWithdrawalAmount ?? '0';
          const assetBalance = await getCapabilityAssetBalance(accountId, capability);

          if (!assetBalance || Number(assetBalance.availableAmount) < Number(minWithdrawalAmount)) {
            continue;
          }

          const participantsIdentification: ParticipantsIdentification = {
            originator: personaIdentificationInfo,
            beneficiary: personaIdentificationInfo,
            originatingVasp: completeVasp,
          };

          const requestBody: BlockchainWithdrawalRequest = {
            idempotencyKey: randomUUID(),
            balanceAmount: minWithdrawalAmount,
            balanceAsset: capability.balanceAsset,
            destination: {
              ...blockchainDestinationConfig,
              amount: minWithdrawalAmount,
              ...capability.withdrawal,
            },
            participantsIdentification,
          };

          const response = await client.transfersBlockchain.createBlockchainWithdrawal({
            accountId,
            requestBody,
          });

          expect(response).toBeDefined();
          expect(response.status).toBe('pending');
          return; // Test passed
        }
      }
    });

    it('should accept partial VASP information with only required fields', async () => {
      const partialVasp: VaspInformation = {
        vaspName: 'Minimal VASP',
      };

      for (const [accountId, capabilities] of accountCapabilitiesMap.entries()) {
        const blockchainCapabilities = capabilities.filter(
          (c) =>
            c.withdrawal.transferMethod === PublicBlockchainCapability.transferMethod.PUBLIC_BLOCKCHAIN
        );

        for (const capability of blockchainCapabilities) {
          const minWithdrawalAmount = capability.minWithdrawalAmount ?? '0';
          const assetBalance = await getCapabilityAssetBalance(accountId, capability);

          if (!assetBalance || Number(assetBalance.availableAmount) < Number(minWithdrawalAmount)) {
            continue;
          }

          const participantsIdentification: ParticipantsIdentification = {
            originator: personaIdentificationInfo,
            beneficiary: personaIdentificationInfo,
            beneficiaryVasp: partialVasp,
          };

          const requestBody: BlockchainWithdrawalRequest = {
            idempotencyKey: randomUUID(),
            balanceAmount: minWithdrawalAmount,
            balanceAsset: capability.balanceAsset,
            destination: {
              ...blockchainDestinationConfig,
              amount: minWithdrawalAmount,
              ...capability.withdrawal,
            },
            participantsIdentification,
          };

          const response = await client.transfersBlockchain.createBlockchainWithdrawal({
            accountId,
            requestBody,
          });

          expect(response).toBeDefined();
          expect(response.status).toBe('pending');
          return; // Test passed
        }
      }
    });

    it('should accept empty VASP information object', async () => {
      const emptyVasp: VaspInformation = {};

      for (const [accountId, capabilities] of accountCapabilitiesMap.entries()) {
        const blockchainCapabilities = capabilities.filter(
          (c) =>
            c.withdrawal.transferMethod === PublicBlockchainCapability.transferMethod.PUBLIC_BLOCKCHAIN
        );

        for (const capability of blockchainCapabilities) {
          const minWithdrawalAmount = capability.minWithdrawalAmount ?? '0';
          const assetBalance = await getCapabilityAssetBalance(accountId, capability);

          if (!assetBalance || Number(assetBalance.availableAmount) < Number(minWithdrawalAmount)) {
            continue;
          }

          const participantsIdentification: ParticipantsIdentification = {
            originator: personaIdentificationInfo,
            beneficiary: personaIdentificationInfo,
            originatingVasp: emptyVasp,
          };

          const requestBody: BlockchainWithdrawalRequest = {
            idempotencyKey: randomUUID(),
            balanceAmount: minWithdrawalAmount,
            balanceAsset: capability.balanceAsset,
            destination: {
              ...blockchainDestinationConfig,
              amount: minWithdrawalAmount,
              ...capability.withdrawal,
            },
            participantsIdentification,
          };

          const response = await client.transfersBlockchain.createBlockchainWithdrawal({
            accountId,
            requestBody,
          });

          expect(response).toBeDefined();
          expect(response.status).toBe('pending');
          return; // Test passed
        }
      }
    });
  });

  describe('ParticipantsIdentification with VASP fields', () => {
    it('should accept originatingVasp field', async () => {
      const vasp: VaspInformation = {
        vaspName: 'Originating VASP',
        vaspCountry: 'GB',
        vaspCode: 'ORIG001',
      };

      for (const [accountId, capabilities] of accountCapabilitiesMap.entries()) {
        const blockchainCapabilities = capabilities.filter(
          (c) =>
            c.withdrawal.transferMethod === PublicBlockchainCapability.transferMethod.PUBLIC_BLOCKCHAIN
        );

        for (const capability of blockchainCapabilities) {
          const minWithdrawalAmount = capability.minWithdrawalAmount ?? '0';
          const assetBalance = await getCapabilityAssetBalance(accountId, capability);

          if (!assetBalance || Number(assetBalance.availableAmount) < Number(minWithdrawalAmount)) {
            continue;
          }

          const participantsIdentification: ParticipantsIdentification = {
            originator: personaIdentificationInfo,
            beneficiary: personaIdentificationInfo,
            originatingVasp: vasp,
          };

          const requestBody: BlockchainWithdrawalRequest = {
            idempotencyKey: randomUUID(),
            balanceAmount: minWithdrawalAmount,
            balanceAsset: capability.balanceAsset,
            destination: {
              ...blockchainDestinationConfig,
              amount: minWithdrawalAmount,
              ...capability.withdrawal,
            },
            participantsIdentification,
          };

          const response = await client.transfersBlockchain.createBlockchainWithdrawal({
            accountId,
            requestBody,
          });

          expect(response).toBeDefined();
          expect(response.status).toBe('pending');
          return; // Test passed
        }
      }
    });

    it('should accept beneficiaryVasp field', async () => {
      const vasp: VaspInformation = {
        vaspName: 'Beneficiary VASP',
        vaspCountry: 'DE',
        vaspWebsite: 'https://beneficiary.example.com',
      };

      for (const [accountId, capabilities] of accountCapabilitiesMap.entries()) {
        const blockchainCapabilities = capabilities.filter(
          (c) =>
            c.withdrawal.transferMethod === PublicBlockchainCapability.transferMethod.PUBLIC_BLOCKCHAIN
        );

        for (const capability of blockchainCapabilities) {
          const minWithdrawalAmount = capability.minWithdrawalAmount ?? '0';
          const assetBalance = await getCapabilityAssetBalance(accountId, capability);

          if (!assetBalance || Number(assetBalance.availableAmount) < Number(minWithdrawalAmount)) {
            continue;
          }

          const participantsIdentification: ParticipantsIdentification = {
            originator: personaIdentificationInfo,
            beneficiary: personaIdentificationInfo,
            beneficiaryVasp: vasp,
          };

          const requestBody: BlockchainWithdrawalRequest = {
            idempotencyKey: randomUUID(),
            balanceAmount: minWithdrawalAmount,
            balanceAsset: capability.balanceAsset,
            destination: {
              ...blockchainDestinationConfig,
              amount: minWithdrawalAmount,
              ...capability.withdrawal,
            },
            participantsIdentification,
          };

          const response = await client.transfersBlockchain.createBlockchainWithdrawal({
            accountId,
            requestBody,
          });

          expect(response).toBeDefined();
          expect(response.status).toBe('pending');
          return; // Test passed
        }
      }
    });

    it('should accept both originatingVasp and beneficiaryVasp fields', async () => {
      const originatingVasp: VaspInformation = {
        vaspName: 'Originating VASP Corp',
        vaspCountry: 'US',
        vaspCode: 'ORIG002',
        vaspRegion: 'Americas',
      };

      const beneficiaryVasp: VaspInformation = {
        vaspName: 'Beneficiary VASP Ltd',
        vaspCountry: 'SG',
        vaspCode: 'BENE002',
        vaspRegion: 'Asia Pacific',
      };

      for (const [accountId, capabilities] of accountCapabilitiesMap.entries()) {
        const blockchainCapabilities = capabilities.filter(
          (c) =>
            c.withdrawal.transferMethod === PublicBlockchainCapability.transferMethod.PUBLIC_BLOCKCHAIN
        );

        for (const capability of blockchainCapabilities) {
          const minWithdrawalAmount = capability.minWithdrawalAmount ?? '0';
          const assetBalance = await getCapabilityAssetBalance(accountId, capability);

          if (!assetBalance || Number(assetBalance.availableAmount) < Number(minWithdrawalAmount)) {
            continue;
          }

          const participantsIdentification: ParticipantsIdentification = {
            originator: personaIdentificationInfo,
            beneficiary: personaIdentificationInfo,
            originatingVasp,
            beneficiaryVasp,
          };

          const requestBody: BlockchainWithdrawalRequest = {
            idempotencyKey: randomUUID(),
            balanceAmount: minWithdrawalAmount,
            balanceAsset: capability.balanceAsset,
            destination: {
              ...blockchainDestinationConfig,
              amount: minWithdrawalAmount,
              ...capability.withdrawal,
            },
            participantsIdentification,
          };

          const response = await client.transfersBlockchain.createBlockchainWithdrawal({
            accountId,
            requestBody,
          });

          expect(response).toBeDefined();
          expect(response.status).toBe('pending');
          return; // Test passed
        }
      }
    });
  });
});
