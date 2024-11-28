import { Repository } from '../repository';
import {
  CollateralAccountLink,
  CollateralAccount,
  CollateralLinkStatus,
  Environment,
  CollateralAsset,
  Blockchain,
  CryptocurrencySymbol,
  NativeCryptocurrency,
  CollateralAssetAddress,
  CollateralAddress,
  PublicBlockchainAddress,
} from '../../../client/generated';
import { randomUUID } from 'crypto';
import { XComError } from '../../../error';
import { fakeSchemaObject } from '../../../schemas';

type CollateralIdentifier = { id: string; collateralAccounts: CollateralAccount[] };
type CollateralAccountLinkIdentifier = {
  id: string;
  collateralAccountLinks: CollateralAccountLink[];
};

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
  private readonly collateralRepository = new Repository<CollateralIdentifier>();
  private readonly collateralAccountLinksRepository =
    new Repository<CollateralAccountLinkIdentifier>();
  private readonly collateralDepositAddressesRepository = new Repository<CollateralAssetAddress>();
  constructor() {
    for (let i = 0; i < 20; i++) {
      const CollateralDepositAddress = fakeSchemaObject(
        'CollateralAssetAddress'
      ) as CollateralAssetAddress;
      CollateralDepositAddress.address.asset = CollateralDepositAddress.asset;
      this.collateralDepositAddressesRepository.create(CollateralDepositAddress);
    }
  }

  public generateCollateralAssets(numAssets: number, env: Environment): CollateralAsset[] {
    const assets: CollateralAsset[] = [];

    for (let i = 0; i < numAssets; i++) {
      assets.push(this.createCollateralAsset(env));
    }

    return assets;
  }

  private createCollateralAsset(env: Environment): NativeCryptocurrency {
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
    if (collateralIdsList[1] !== accountId) {
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
      id: randomUUID(),
      collateralId: collateralAccount.collateralId,
      collateralSigners: collateralAccount.collateralSigners || [],
      eligibleCollateralAssets: this.generateCollateralAssets(2, collateralAccount.env),
      status: CollateralLinkStatus.ELIGIBLE,
      env: Environment.PROD,
    };
    return newCollateralAccountLink;
  }

  public getCollateralAccountLinks(accountId: string): CollateralAccountLink[] {
    const collateralLinks = this.collateralAccountLinksRepository.find(accountId);

    return collateralLinks?.collateralAccountLinks || [];
  }

  public registerCollateralAccount(accountId: string, collateralId: string): CollateralAccount {
    const collateralIdsList = collateralId.split('.');
    if (collateralIdsList.length !== 3 || collateralIdsList[1] !== accountId) {
      throw new CollateralAccountNotExist();
    }

    collateralIdsList.forEach((id) => {
      if (!isUUIDv4(id)) {
        throw new CollateralAccountNotExist();
      }
    });

    const newCollateralAccount: CollateralAccount = {
      id: randomUUID(),
      collateralId: collateralId,
      collateralSigners: [randomUUID(), randomUUID()],
      env: Environment.PROD,
    };

    this.collateralRepository.create({ id: accountId, collateralAccounts: [newCollateralAccount] });
    return newCollateralAccount[0];
  }

  public getCollateralDepositAddresses(): CollateralAssetAddress[] {
    const CollateralDepositAddress = this.collateralDepositAddressesRepository.list();

    if (!CollateralDepositAddress) {
      throw new CollateralAccountNotExist();
    }

    return CollateralDepositAddress;
  }

  public createCollateralDepositAddressForAsset(
    address: PublicBlockchainAddress,
    recoveryAccountId: string,
    fireblocksAssetId: string,
    accountId: string
  ): CollateralAssetAddress {
    const asset: NativeCryptocurrency = this.createCollateralAsset(Environment.PROD);
    const newCollateralDepositAddress: CollateralAssetAddress = {
      id: accountId,
      address: address,
      recoveryAccountId: recoveryAccountId,
      asset: asset,
      fireblocksAssetId: fireblocksAssetId,
    };
    this.collateralDepositAddressesRepository.create(newCollateralDepositAddress);
    return newCollateralDepositAddress;
  }

  public getCollateralDepositAddressesForAsset(fireblocksAssetId: string): CollateralAddress[] {
    const CollateralDepositAddress = this.collateralDepositAddressesRepository.list();

    const CollateralDepositAddressForAsset = CollateralDepositAddress.filter(
      (address) => address.fireblocksAssetId === fireblocksAssetId
    );

    if (!CollateralDepositAddressForAsset) {
      throw new CollateralAccountNotExist();
    }

    return CollateralDepositAddressForAsset;
  }

  public getAllCollateralAccounts(): CollateralAccount[] {
    return this.collateralRepository.list().map((account) => account.collateralAccounts[0]);
  }
}
