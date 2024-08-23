module.exports = {
  extends: [
    './base.js',
    '@vercel/style-guide/eslint/react',
    './override.js',
  ].map(require.resolve),
  rules: {
    'react/display-name': 'off',
    'react/function-component-definition': ['warn', { namedComponents: 'arrow-function' }],
  },
};

