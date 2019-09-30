module.exports = {
  root: true,
  extends: '@dooboo/eslint-config',
  rules: {
    'max-len': [
      'error',
      {
        code: 100,
        ignoreRegExpLiterals: true,
        ignoreComments: true,
        ignoreUrls: true,
        ignoreStrings: true,
      },
    ],
  },
};
