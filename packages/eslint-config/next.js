module.exports = {
  extends: [
    './react.js',
    '@vercel/style-guide/eslint/jest-react',
    '@vercel/style-guide/eslint/next',
  ].map(require.resolve),
};

