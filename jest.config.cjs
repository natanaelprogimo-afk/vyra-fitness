module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/tests/**/*.test.[jt]s?(x)'],
  transform: {
    '^.+\\.[jt]sx?$': 'babel-jest',
  },
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },
  verbose: true,
};
