export const itif = (condition: boolean, ...args: Parameters<jest.It>): void =>
  condition ? it(...args) : it.skip(...args);
export const describeif = (condition: boolean, ...args: Parameters<jest.Describe>): void =>
  condition ? describe(...args) : describe.skip(...args);
