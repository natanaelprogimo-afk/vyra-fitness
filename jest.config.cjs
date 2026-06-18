module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/tests/**/*.test.[jt]s?(x)'],
  setupFiles: ['<rootDir>/tests/jest.setup.cjs'],
  transform: {
    '^.+\\.[jt]sx?$': 'babel-jest',
  },
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
    '^expo/virtual/env$': '<rootDir>/tests/mocks/expoVirtualEnv.cjs',
    '^expo-secure-store$': '<rootDir>/tests/mocks/expoSecureStore.cjs',
    '^react-native$': '<rootDir>/tests/mocks/reactNative.cjs',
  },
  verbose: true,
};
