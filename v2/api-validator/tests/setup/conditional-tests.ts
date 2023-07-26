import 'jest';

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace jest {
    interface Describe {
      skipIf: (skip: boolean) => Describe;
    }
    interface It {
      skipIf: (skip: boolean) => It;
    }
  }
}

describe.skipIf = (skip: boolean) => (skip ? describe.skip : describe);
it.skipIf = (skip: boolean) => (skip ? it.skip : it);
