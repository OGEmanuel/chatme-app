module.exports = {
  preset: 'jest-expo',
  roots: ['<rootDir>/app', '<rootDir>/components', '<rootDir>/hooks', '<rootDir>/lib', '<rootDir>/screens'],
  testMatch: ['**/__tests__/**/*.(test|spec).[jt]s?(x)', '**/?(*.)+(test|spec).[jt]s?(x)'],
  collectCoverageFrom: [
    'app/**/*.{ts,tsx}',
    'components/**/*.{ts,tsx}',
    'hooks/**/*.{ts,tsx}',
    'lib/**/*.{ts,tsx}',
    'screens/**/*.{ts,tsx}',
  ],
};
