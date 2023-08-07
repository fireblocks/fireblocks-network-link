import { isKnownSubAccount } from './accounts-controller';

type AccountId = string;

export class ControllersContainer<T> {
  private readonly controllers = new Map<AccountId, T>();

  constructor(private readonly factory: (accountId: AccountId) => T) {}

  public getController(accountId: string): T | undefined {
    if (!isKnownSubAccount(accountId)) {
      return;
    }
    if (this.controllers.has(accountId)) {
      return this.controllers.get(accountId);
    }

    const controller = this.factory(accountId);
    this.controllers.set(accountId, controller);

    return controller;
  }
}
