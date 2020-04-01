module.exports = {
  roots: ['src'],
  transform: { '\\.ts$': ['ts-jest'] },
  collectCoverage: false,
  collectCoverageFrom: ['src/**/*.{ts,js}'],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: -10,
    },
  },
};
