export default {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  testMatch: ['**/*.spec.ts[x]'],
  setupFilesAfterEnv: ['<rootDir>/setup-jest.ts'],
};

