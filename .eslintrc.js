module.exports = {
  extends: [
    'next/core-web-vitals',
    'plugin:import/typescript',
    'airbnb',
    'airbnb-typescript',
  ],
  parserOptions: {
    project: './tsconfig.json',
  },
  ignorePatterns: ['.eslintrc.js', 'build/', 'next.config.mjs', 'jest.*.js'],
  rules: {
    'import/prefer-default-export': 'off',
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

    // React
    'react/react-in-jsx-scope': 'off',
    'react/jsx-indent': 'warn',
    'react/jsx-indent-props': 'warn',
    'react/jsx-first-prop-new-line': 'warn',
    'react/jsx-closing-bracket-location': 'warn',
    'react/function-component-definition': 'off',
    'react/jsx-props-no-spreading': 'off',
  },
};
