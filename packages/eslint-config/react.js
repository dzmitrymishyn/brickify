module.exports = {
  extends: [
    './base.js',
    '@vercel/style-guide/eslint/react',
    '@vercel/style-guide/eslint/jest-react',
  ].map(require.resolve),
  rules: {
    'react/function-component-definition': ['warn', { namedComponents: 'arrow-function' }],
  },
};

