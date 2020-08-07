module.exports = {
  root: true,

  env: {
    browser: true,
    node: true,
    es6: true
  },

  extends: [
    'plugin:vue/essential',
    '@vue/recommended'
  ],

  parserOptions: {
    parser: 'babel-eslint',
    sourceType: 'module'
  },

  rules: {
    'no-console': 'off',
    'no-debugger': 'off',
    'space-before-function-paren': 0,
    'prefer-const': 0
  },

  parserOptions: {
    parser: 'babel-eslint'
  },

  extends: [
    'plugin:vue/essential',
    '@vue/standard'
  ]
}
