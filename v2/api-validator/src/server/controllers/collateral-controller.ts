import { Repository } from './repository';
import {
  CollateralAccountLink,
  CollateralAccount,
  CollateralLinkStatus,
  Environment,
  CollateralAsset,
  Blockchain,
  CryptocurrencySymbol,
  Account,
  CollateralAssetAddress,
  PublicBlockchainCapability
} from '../../client/generated';
import { randomUUID } from 'crypto';
import { XComError } from '../../error';

export class CollateralAccountNotExist extends XComError {
  constructor() {
    super('Collateral Account Not Found');
  }
}

function isUUIDv4(uuid: string): boolean {
  const uuidv4Regex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidv4Regex.test(uuid);
}
export class CollateralController {
  private readonly collateralRepository = new Repository<CollateralAccount & Account>();
  // private readonly collateralAssetRepository = new Repository<CollateralAssetAddress & Account>();

  constructor() {}

  public generateCollateralAssets(numAssets: number, env: Environment): CollateralAsset[] {
    const assets: CollateralAsset[] = [];

    for (let i = 0; i < numAssets; i++) {
      assets.push(this.createCollateralAsset(env));
    }

    return assets;
  }

  public generateCollateralAssetAddress(numAssets: number): CollateralAssetAddress[] {
    const depositAddress: CollateralAssetAddress[] = [];
    const asset = this.generateCollateralAssets(2, Environment.PROD);
    const address: CollateralAssetAddress = {
      address: {
        address: randomUUID(),
        addressTag: randomUUID(),
        transferMethod: PublicBlockchainCapability.transferMethod.PUBLIC_BLOCKCHAIN,
        asset: asset[0]
      },
      recoveryAccountId: randomUUID(),
      asset: asset[0],
    fireblocksAssetId: 'BTC'
    }

    for (let i = 0; i < numAssets; i++) {
      depositAddress.push(address);
    }

    return depositAddress;
  }

  private createCollateralAsset(env: Environment): CollateralAsset {
    const isTestAsset: boolean = env === Environment.SANDBOX ? true : false;
    return {
      blockchain: Blockchain.BITCOIN,
      cryptocurrencySymbol: CryptocurrencySymbol.BTC,
      testAsset: isTestAsset,
    };
  }

  public createCollateralAccountLink(
    accountId: string,
    collateralAccount: CollateralAccount
  ): CollateralAccount {
    if (!accountId) {
      throw new CollateralAccountNotExist();
    }

    const collateralIdsList = collateralAccount.collateralId.split('.');
    if (collateralIdsList[1] != accountId) {
      throw new CollateralAccountNotExist();
    }
    for (const id of collateralIdsList) {
      if (!isUUIDv4(id)) {
        throw new CollateralAccountNotExist();
      }
    }

    for (const signer of collateralAccount.collateralSigners) {
      if (!isUUIDv4(signer)) {
        throw new CollateralAccountNotExist();
      }
    }

    const newCollateralAccountLink: CollateralAccountLink = {
      collateralId: collateralAccount.collateralId,
      collateralSigners: collateralAccount.collateralSigners || [],
      eligibleCollateralAssets: this.generateCollateralAssets(2, collateralAccount.env),
      status: CollateralLinkStatus.ELIGIBLE,
      env: Environment.PROD,
    };
    return newCollateralAccountLink;
  }

  public getCollateralAccountLinks(): CollateralAccount[] {
    const accountId = randomUUID();
    const collateralId = `${randomUUID()}.${accountId}.${randomUUID()}`;
    const collateralSinersList = [randomUUID(), randomUUID(), randomUUID()];
    const requestBody = {
      collateralId: collateralId,
      collateralSigners: collateralSinersList,
      env: Environment.PROD,
    };
    this.createCollateralAccountLink(accountId, requestBody);
    return this.collateralRepository.list();
  }

  public getCollateralDepositAddresses(): CollateralAssetAddress[] {
    return this.generateCollateralAssetAddress(2)
  }
}
