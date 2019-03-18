module.exports = {
  extends: 'standard',
  env: {
    browser: true
  },
  rules: {
    'no-unused-vars': 0,
    'comma-dangle': ['error', 'always-multiline'],
    'semi': [2, 'always'],
    'arrow-parens': ['error', 'always'],
    'space-before-function-paren': ['error', 'never'],
    'no-new-object': 'error',
    'no-array-constructor': 'error'
  },
  'parser': 'babel-eslint'
};
