module.exports = {
  root: true,

  env: {
    node: true
  },

  rules: {
    'no-console': 'off',
    'no-debugger': 'off',
    'space-before-function-paren': 0,
    'vue/eqeqeq': 'warn',
    'no-eq-null': 2, //禁止使用空label
    'no-extra-semi': 2, //禁止多余的冒号
    'no-trailing-spaces': 1, //一行结束后面不要有空格
    'spaced-comment': 0, //注释风格要不要有空格什么的
    'no-irregular-whitespace': 2, //不能有不规则的空格
    'space-in-parens': [0, 'never'], //小括号里面要不要有空格
    'sort-vars': 0, //变量声明时排序
    'no-extra-parens': 2 //禁止非必要的括号
  },

  parserOptions: {
    parser: 'babel-eslint'
  },

  extends: [
    'plugin:vue/essential',
    '@vue/standard'
  ]
}
