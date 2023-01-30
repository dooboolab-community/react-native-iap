// In documentation there is `preset: expo-module-scripts`, but it runs tests for every platform (ios, android, web, node)
// We need only node tests right now
module.exports = {
  preset: 'jest-expo/node',
};
