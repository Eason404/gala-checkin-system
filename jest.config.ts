/** @type {import('ts-jest').JestConfigWithTsJest} */
export default {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  moduleNameMapper: {
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
    '^.*/firebaseConfig$': '<rootDir>/__mocks__/firebaseConfig.ts'
  },
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
};
