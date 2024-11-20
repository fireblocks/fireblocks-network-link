import { 
    CollateralAccount,
    CollateralService, 
 } from '../../src/client/generated';
 import Client from '../../src/client';
import { getCapableAccountId, hasCapability } from '../utils/capable-accounts';
import { AssetsDirectory } from '../utils/assets-directory';
import {
    ApiError,
    BadRequestError,
    CollateralLinkStatus,
    RequestPart,
    CollateralAccountLink,
    Environment,
    CollateralAsset,
    Blockchain,
    CryptocurrencySymbol,
  } from '../../src/client/generated';
import { randomUUID } from 'crypto';

const noCollateralapability = !hasCapability('collateral');

describe.skipIf(noCollateralapability)('collateral', () => {
  let client: Client;
  let assets: AssetsDirectory;
  let accountId: string;
  let collateralId: string;
  let collateralSinersList: string[];

  type CollateralAccountWithStatus = CollateralAccount & {status: CollateralLinkStatus}


  beforeAll(async () => {
    client = new Client();
    assets = await AssetsDirectory.fetch();
    accountId = getCapableAccountId('collateral');
    collateralId = `${accountId}.${randomUUID()}`
    collateralSinersList = [randomUUID(), randomUUID(),randomUUID()]
  });

    describe('get collateral accounts linked', () => {
    let collateralAccount: CollateralAccountWithStatus;

    const GetCreateCollateralAccountLinksSuccessResult = async (requestBody: CollateralAccountWithStatus) =>
        client.collateral.createCollateralAccountLink({ accountId, requestBody });
    
        const GetCreateCollateralAccountLinksFailureResult = async (requestBody: CollateralAccountWithStatus): Promise<ApiError> => {
        try {
            await client.collateral.createCollateralAccountLink({ accountId, requestBody });
        } catch (err) {
            if (err instanceof ApiError) {
            return err;
            }
            throw err;
        }
        throw new Error('Expected to throw');
        };

        it('collateral account should return with status eligble', async () => {
            const createCollateralLink = await GetCreateCollateralAccountLinksSuccessResult(
                {status:CollateralLinkStatus.ELIGIBLE, collateralId: collateralId, collateralSigners: collateralSinersList, env: Environment.PROD});
            expect(createCollateralLink.status).toBe(CollateralLinkStatus.ELIGIBLE);
            expect(createCollateralLink.env).toBe(Environment.PROD);
            expect(createCollateralLink.collateralId).toBe(collateralId);
            expect(createCollateralLink.collateralSigners).toEqual(collateralSinersList);
            expect(createCollateralLink.eligibleCollateralAssets[0]['blockchain']).toBe(Blockchain.BITCOIN);
            expect(createCollateralLink.eligibleCollateralAssets[0]['cryptocurrencySymbol']).toBe(CryptocurrencySymbol.BTC);
            expect(createCollateralLink.eligibleCollateralAssets[0]['testAsset']).toEqual(false);
            expect(createCollateralLink.eligibleCollateralAssets.length).toEqual(2);
        });

        it('collateral account should return with status linked, env sandbox & testAsset true', async () => {
            const createCollateralLink = await GetCreateCollateralAccountLinksSuccessResult(
                {status:CollateralLinkStatus.LINKED, collateralId: collateralId, collateralSigners: collateralSinersList, env: Environment.SANDBOX});
            expect(createCollateralLink.status).toBe(CollateralLinkStatus.LINKED);
            expect(createCollateralLink.env).toBe(Environment.SANDBOX);
            expect(createCollateralLink.eligibleCollateralAssets[0]['testAsset']).toEqual(true);
        });

        it('collateral account should return rejection reason', async () => {
            const createCollateralLink = await GetCreateCollateralAccountLinksSuccessResult(
                {status:CollateralLinkStatus.FAILED, collateralId: collateralId, collateralSigners: collateralSinersList, env: Environment.SANDBOX});
            expect(createCollateralLink.rejectionReason).not.toBe(undefined);
            expect(typeof createCollateralLink.rejectionReason).toBe('string');
        });

        it('request should fail schema property', async () => {
            const error = await GetCreateCollateralAccountLinksFailureResult({
                ...collateralAccount
        });

        expect(error.status).toBe(400);
        expect(error.body.errorType).toBe(BadRequestError.errorType.SCHEMA_PROPERTY_ERROR);
        expect(error.body.requestPart).toBe(RequestPart.BODY);
        })

    });

});
  