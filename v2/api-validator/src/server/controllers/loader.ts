import { AccountsController } from './accounts-controller';
import { AssetsController } from './assets-controller';

export function loadFakeData(): void {
  AssetsController.init();
  AccountsController.init();
}
