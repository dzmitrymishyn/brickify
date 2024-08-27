import { type Plugin } from './plugins';

export const getPlugins = (plugins: Record<string | symbol, Plugin>) => [
  ...Object.values(plugins),
  ...Object.getOwnPropertySymbols(plugins).map((token) => plugins[token]),
];
