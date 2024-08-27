module.exports = {
  extends: [
    './base.js',
    '@vercel/style-guide/eslint/jest-react',
  ].map(require.resolve),
};

