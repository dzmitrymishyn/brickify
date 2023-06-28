module.exports = {
  extends: [
    'next/core-web-vitals',
    'eslint-config-airbnb-typescript',
    'plugin:import/typescript',
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
    sourceType: 'module',
    ecmaVersion: 12,
    tsconfigRootDir: __dirname,
    project: './tsconfig.json',
  },
  ignorePatterns: ['.eslintrc.js', 'build/', 'next.config.js'],
  rules: {
    '@typescript-eslint/indent': 'warn',
    'sort-imports': ['warn', {
      ignoreCase: true,
      ignoreDeclarationSort: true,
      ignoreMemberSort: false,
      allowSeparatedGroups: false,
    }],
    'import/order': ['warn', {
      alphabetize: { order: 'asc', orderImportKind: 'asc', caseInsensitive: true },
      'newlines-between': 'always',
      warnOnUnassignedImports: true,
      groups: ['builtin', 'external', 'internal'],
      pathGroups: [
        {
          pattern: 'react',
          group: 'external',
          position: 'before',
        },
      ].flat(),
    }],
  },
};
