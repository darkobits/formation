module.exports = {
  moduleDirectories: [
    '<rootDir>',
    '<rootDir>/src',
    '<rootDir>/tests',
    'node_modules'
  ],
  testPathIgnorePatterns: [
    '/dist/'
  ],
  coveragePathIgnorePatterns: [
    '/dist/',
    '/tests/'
  ],
  setupFiles: [
    '<rootDir>/src/etc/testSetup.js'
  ],
  coverageThreshold: {
    global: {
      statements: 90,
      branches: 80,
      functions: 90,
      lines: 90
    }
  }
};
