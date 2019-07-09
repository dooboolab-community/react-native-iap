/**
 * Metro configuration for React Native
 * https://github.com/facebook/react-native
 *
 * @format
 */

const fs = require('fs');
const blacklist = require('metro-config/src/defaults/blacklist');
const path = require('path');

module.exports = {
  // Enables metro to find the symlinked react-native-iap dependency though it does not support symlinks.
  // Inspired by https://blog.callstack.io/adding-an-example-app-to-your-react-native-library-d23b9741a19c
  watchFolders: [path.resolve(__dirname, '..')],
  resolver: {
    providesModuleNodeModules: [
      'react-native',
      'react',
      '@babel/runtime',
    ],
    blacklistRE: blacklist([
      new RegExp(
        `^${escape(path.resolve(__dirname, '..', 'node_modules'))}\\/.*$`
      ),
    ]),
  },
  transformer: {
    getTransformOptions: async() => ({
      transform: {
        experimentalImportSupport: false,
        inlineRequires: false,
      },
    }),
  },
};
