import { Config } from '@jest/types';

const config: Config.InitialOptions = {
  moduleFileExtensions: ['ts', 'js', 'json'],
  transform: {
    '^.+\\.ts$': 'ts-jest', // Use ts-jest to transform TypeScript files
  },
  testEnvironment: 'node', // Set the test environment to Node.js
  transformIgnorePatterns: [
    '/node_modules/(?!(axios)/)', // Transform axios and other ES modules
  ],
  moduleNameMapper: {
    // Handle ES Module paths if necessary
    '^axios$': require.resolve('axios'),
    '^src/(.*)$': '<rootDir>/src/$1', // Map `src/...` to the correct directory

  },
};

export default config;

