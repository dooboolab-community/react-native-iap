module.exports = {
  "extends": "standard",
  "env": {
    "browser": true
  },
  "rules": {
    "no-unused-expressions": 0,
    "no-unused-vars": 0,
    "no-return-assign": 0,
    "comma-dangle": ["error", {
      "arrays": "always",
      "objects": "always",
      "imports": "always",
      "exports": "always",
      "functions": "ignore",
    }],
    "semi": [2, "always"],
    "arrow-parens": ["error", "always"],
    "space-before-function-paren": ["error", "never"],
    "standard/object-curly-even-spacing": 0,
    "no-new-object": "error",
    "no-array-constructor": "error",
    "no-cond-assign": 0,
  },
  "plugins": [
    "standard",
    "promise",
  ],
  "parser": "babel-eslint"
};