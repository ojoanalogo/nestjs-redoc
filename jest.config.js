module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  collectCoverage: true,
  collectCoverageFrom: [
    "src/**/*.ts"
  ],
  testMatch: [
    "**/*.spec.ts",
  ],
  coverageReporters: ['lcov', 'text']
};
