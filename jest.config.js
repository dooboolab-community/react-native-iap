module.exports = {
  clearMocks: true,
  coverageDirectory: 'coverage',
  moduleDirectories: ['node_modules', 'src'],
  modulePathIgnorePatterns: ['IapExample', 'lib', 'fixtures'],
  preset: 'react-native',
  setupFiles: ['<rootDir>/test/mocks/react-native-modules.js'],
  transform: {
    '^.+\\.(js|jsx|ts|tsx)$': 'babel-jest',
    '\\.(ts|tsx)$': 'ts-jest',
  },
  transformIgnorePatterns: ['node_modules/(?!@react-native|react-native)'],
};
