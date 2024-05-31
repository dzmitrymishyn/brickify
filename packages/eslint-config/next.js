const path = require('path');

const project = path.resolve(process.cwd(), 'tsconfig.json');

/*
 * This is a custom ESLint configuration for use with
 * Next.js apps.
 *
 * This config extends the Vercel Engineering Style Guide.
 * For more information, see https://github.com/vercel/style-guide
 *
 */

module.exports = {
  extends: [
    './base.js',
    '@vercel/style-guide/eslint/react',
    '@vercel/style-guide/eslint/jest-react',
    '@vercel/style-guide/eslint/next',
  ].map(require.resolve),
  rules: {
    'react/function-component-definition': ['warn', { namedComponents: 'arrow-function' }],
  },
};

