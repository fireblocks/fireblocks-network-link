import { Repository } from './repository';
import {
  CollateralAccountLink,
  CollateralAccount,
  CollateralLinkStatus,
  Environment,
  CollateralAsset,
  Blockchain,
  CryptocurrencySymbol,
} from '../../client/generated';
import { XComError } from '../../error';

export class CollateralAccountNotExist extends XComError {
  constructor() {
    super('Collateral Account Not Found');
  }
}

type CollateralAccountLinkWithId = CollateralAccountLink & { id: string };

export class CollateralController {
  private readonly collateralRepository = new Repository<CollateralAccountLinkWithId>();

  constructor() {}

  public generateCollateralAssets(numAssets: number, env: Environment): CollateralAsset[] {
    const assets: CollateralAsset[] = [];

    for (let i = 0; i < numAssets; i++) {
      assets.push(this.createCollateralAsset(env));
    }

    return assets;
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
    status: CollateralLinkStatus,
    accountId,
    collateralAccount: CollateralAccount
  ): CollateralAccountLinkWithId {
    const newCollateralAccountLink: CollateralAccountLinkWithId = {
      id: accountId,
      collateralId: collateralAccount.collateralId,
      collateralSigners: collateralAccount.collateralSigners || [],
      eligibleCollateralAssets: this.generateCollateralAssets(2, collateralAccount.env),
      status: status,
      env: collateralAccount.env,
    };
    status == CollateralLinkStatus.FAILED
      ? (newCollateralAccountLink.rejectionReason = 'Rejected: unknown account')
      : status == CollateralLinkStatus.DISABLED
      ? (newCollateralAccountLink.rejectionReason = 'Rejected: account is disabled')
      : this.collateralRepository.create(newCollateralAccountLink);
    return newCollateralAccountLink;
  }

  public getCollateralAccountLinks(): CollateralAccountLink[] {
    return this.collateralRepository.list();
  }
}
