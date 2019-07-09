/**
 * Metro configuration for React Native
 * https://github.com/facebook/react-native
 *
 * @format
 */

module.exports = {
  transformer: {
    getTransformOptions: async() => ({
      transform: {
        experimentalImportSupport: false,
        inlineRequires: false,
      },
    }),
  },
};

const fs = require('fs');
const getDevPaths = require('get-dev-paths');

const projectRoot = __dirname;
module.exports = {
  // Old way
  getProjectRoots: () => Array.from(new Set(
    getDevPaths(projectRoot).map($ => fs.realpathSync($))
  )),
  // New way
  watchFolders: Array.from(new Set(
    getDevPaths(projectRoot).map($ => fs.realpathSync($))
  ))
}