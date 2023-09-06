module.exports = {
  env: {
    es2020: true,
    node: true
  },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended'
  ],
  parser: '@typescript-eslint/parser',
  plugins: [
    '@typescript-eslint'
  ],
  root: true,
  rules: {
    'eol-last': ['error', 'always'],
    indent: ['error', 2, { 'SwitchCase': 1 }],
    'linebreak-style': ['error', 'unix'],
    'no-console': 'off',
    'no-trailing-spaces': 'error',
    quotes: ['error', 'single', { 'allowTemplateLiterals': true }],
    semi: ['error', 'never']
  }
}
