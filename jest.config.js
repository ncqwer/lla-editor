const base = require('./config/jest.config.base');

module.exports = {
  ...base,
  projects: ['<rootDir>/packages/*/jest.config.js'],
  roots: undefined,
  // coverageDirectory: '<rootDir>/coverage/',
};
