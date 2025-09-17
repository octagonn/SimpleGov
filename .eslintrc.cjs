module.exports = {
  root: true,
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
    'prettier'
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2022,
    sourceType: 'module',
    ecmaFeatures: { jsx: true }
  },
  env: {
    es2022: true,
    node: true,
    jest: true
  },
  settings: {
    react: {
      version: 'detect'
    }
  },
  ignorePatterns: ['node_modules/', 'dist/']
};
