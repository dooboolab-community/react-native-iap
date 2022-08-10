module.exports = {
  root: true,
  parser: '@babel/eslint-parser',
  extends: ['@react-native-community', 'prettier'],
  plugins: ['@typescript-eslint', 'prettier', 'simple-import-sort', 'jest'],
  rules: {
    '@typescript-eslint/no-unused-vars': 'off',
    'prettier/prettier': 'error',
    'simple-import-sort/imports': [
      'error',
      {
        groups: [
          ['^\\u0000'],
          ['^react', '^@?\\w'],
          ['^\\.\\.(?!/?$)', '^\\.\\./?$'],
          ['^\\./(?=.*/)(?!/?$)', '^\\.(?!/?$)', '^\\./?$'],
        ],
      },
    ],
  },
};
