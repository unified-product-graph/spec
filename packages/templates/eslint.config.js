import tseslint from 'typescript-eslint'

export default tseslint.config(
  { files: ['**/*.ts'] },
  ...tseslint.configs.recommended,
  {
    rules: {
      // Warn on unused vars/args; underscore prefix opts out.
      '@typescript-eslint/no-unused-vars': [
        'warn',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_', caughtErrorsIgnorePattern: '^_' },
      ],
      // Warn on explicit any rather than error, so reviewers can decide case by case.
      '@typescript-eslint/no-explicit-any': 'warn',
      // Warn on prefer-const; auto-fixable, low priority.
      'prefer-const': 'warn',
    },
  },
  {
    ignores: ['dist/**', 'node_modules/**'],
  },
)
