module.exports = {
  presets: ['module:metro-react-native-babel-preset',
  '@babel/preset-typescript',
  "@babel/preset-env",
  '@babel/preset-react',],
  plugins: [
    '@babel/plugin-proposal-class-properties',
    '@babel/plugin-proposal-private-methods',
  ],
};
