export default {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testPathIgnorePatterns: ['/node_modules/', '/dist/'],
  setupFiles: ['./tests/setup/preload-schemas.ts', './tests/setup/preload-capabilities.ts'],
};
