module.exports = [
  {
    files: ['**/*.js'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'commonjs',
      globals: {
        console: 'readonly',
        process: 'readonly',
        require: 'readonly',
        module: 'readonly',
        __dirname: 'readonly',
        __filename: 'readonly',
        URL: 'readonly'
      }
    },
    rules: {
      'no-unused-vars': ['error', { 'argsIgnorePattern': '^_', 'varsIgnorePattern': '^_', 'caughtErrorsIgnorePattern': '^_' }],
      'no-undef': 'error',
      'semi': ['error', 'never'],
      'quotes': ['error', 'single'],
      'indent': ['error', 2]
    }
  }
]
