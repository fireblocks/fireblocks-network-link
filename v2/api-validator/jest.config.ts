export default {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testPathIgnorePatterns: ['/node_modules/', '/dist/'],
  setupFiles: ['./tests/setup/preload-schemas.ts'],
  reporters: [
    'default',
    [
      'jest-html-reporters',
      {
        pageTitle: 'Fireblocks Network Link API v2 Validation Test Results',
        filename: 'test-results.html',
      },
    ],
  ],
};