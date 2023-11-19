module.exports = {
  env: {
    browser: true,
    es2021: true,
  },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react/recommended',
    'react',
  ],
  overrides: [
    {
      env: {
        node: true,
      },
      files: ['.eslintrc.{js,cjs}'],
      parserOptions: {
        sourceType: 'script',
      },
    },
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true,
    },
  },
  plugins: ['@typescript-eslint', 'react'],
  rules: {
    'no-unused-vars': ['error', { varsIgnorePattern: '^React$' }],
    semi: ['error', 'never'],
    'space-before-function-paren': 'off',
    indent: ['error', 2],
    'quote-props': 'off',
    'comma-dangle': ['error', 'always-multiline'],
    'jsx-quotes': ['error', 'prefer-single'],
  },
}
