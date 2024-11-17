import { type PluginMap, type PluginToken } from './plugins';
import { useRendererContextUnsafe } from '../context';
import assert from 'assert';

export const usePluginUnsafe = <T>(
  token: PluginToken,
  pluginsProp?: PluginMap,
): T | undefined => {
  const context = useRendererContextUnsafe();

  return pluginsProp?.[token]?.controller as T | undefined
    ?? context?.plugins?.[token]?.controller as T | undefined;
};

export const usePlugin = <T>(
  token: PluginToken,
  pluginsProp?: PluginMap,
): T => {
  const controller = usePluginUnsafe<T>(token, pluginsProp);

  assert(controller, `${token.toString()} plugin must be registered`);

  return controller;
};
