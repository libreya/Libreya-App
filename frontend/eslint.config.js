module.exports = [
  {
    ignores: ['node_modules/', '.next/', 'dist/', 'build/', 'app-expo-old/'],
  },
  {
    files: ['pages/**/*.ts', 'pages/**/*.tsx', 'lib/**/*.ts', 'components/**/*.tsx'],
    languageOptions: {
      parser: require('@typescript-eslint/parser'),
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        ecmaFeatures: {
          jsx: true,
        },
      },
      globals: {
        React: 'readonly',
        JSX: 'readonly',
      },
    },
    plugins: {
      '@typescript-eslint': require('@typescript-eslint/eslint-plugin'),
    },
    rules: {
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
    },
  },
];
