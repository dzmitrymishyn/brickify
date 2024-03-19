const nextJest = require('next/jest');

const createJestConfig = nextJest({
  dir: './',
});

const config = {
  moduleDirectories: ['node_modules', 'src/'],
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['./jest.setup.js'],
};

module.exports = createJestConfig(config);
