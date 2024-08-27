module.exports = {
  extends: [
    './base.js',
    '@vercel/style-guide/eslint/react',
    '@vercel/style-guide/eslint/jest-react',
    './override.js',
  ].map(require.resolve),
  rules: {
    'react/display-name': 'off',
    'react/function-component-definition': ['warn', { namedComponents: 'arrow-function' }],
  },
};

