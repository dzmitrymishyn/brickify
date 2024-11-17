import { type PluginMap } from './plugins';

export const getPlugins = (plugins: PluginMap) => [
  ...Object.values(plugins),
  ...Object.getOwnPropertySymbols(plugins).map((token) => plugins[token]),
];
