module.exports = {
  extends: [
    './react.js',
    '@vercel/style-guide/eslint/next',
  ].map(require.resolve),
};

